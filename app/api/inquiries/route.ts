import { z } from 'zod';
import { after } from 'next/server';
import { getDatabase, getPhotoStorage } from '@/db';
import { inquirySchema, photoLimits, photoTypes } from '@/lib/inquiry';
import { drainInquiryEmails } from '@/lib/server/inquiry-delivery';

const websiteOrigins = new Set([
  'https://aloriadesign.com',
  'https://www.aloriadesign.com',
  'https://j6cvk7j7hj-max.github.io',
]);

function allowsOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  return (
    !origin ||
    origin === new URL(request.url).origin ||
    websiteOrigins.has(origin)
  );
}

function responseHeaders(request: Request) {
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' });
  const origin = request.headers.get('Origin');
  if (origin && allowsOrigin(request))
    headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

export function OPTIONS(request: Request) {
  const headers = responseHeaders(request);
  if (!allowsOrigin(request))
    return new Response(null, { status: 403, headers });
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Max-Age', '86400');
  return new Response(null, { status: 204, headers });
}
const MAX_BODY = 16 * 1024 * 1024;
function imageSignature(bytes: Uint8Array, type: string) {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  if (type === 'image/jpeg')
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === 'image/png')
    return (
      bytes[0] === 137 &&
      ascii(1, 4) === 'PNG' &&
      bytes[4] === 13 &&
      bytes[5] === 10 &&
      bytes[6] === 26 &&
      bytes[7] === 10
    );
  if (type === 'image/webp')
    return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  if (type === 'image/avif')
    return ascii(4, 8) === 'ftyp' && /avif|avis/.test(ascii(8, 40));
  return false;
}
export async function POST(request: Request) {
  const json = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: responseHeaders(request) });
  if (!allowsOrigin(request))
    return json(
      { error: 'Please submit your inquiry from this website.' },
      403,
    );
  if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data'))
    return json({ error: 'Please use the project inquiry form.' }, 415);
  if (Number(request.headers.get('Content-Length')) > MAX_BODY)
    return json(
      { error: 'Please keep your photos under 15 MB in total.' },
      413,
    );
  const uploaded: string[] = [];
  let committed = false;
  try {
    // Bound the streamed body too, since Content-Length is not always supplied.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Your inquiry was empty.' }, 400);
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) {
        await reader.cancel();
        return json(
          { error: 'Please keep your photos under 15 MB in total.' },
          413,
        );
      }
      chunks.push(new Uint8Array(value));
    }
    const form = await new Response(new Blob(chunks), {
      headers: { 'Content-Type': request.headers.get('Content-Type')! },
    }).formData();
    if (form.get('website'))
      return json(
        { error: 'Your inquiry could not be submitted. Please try again.' },
        400,
      );
    const id = z.uuid().safeParse(form.get('requestId'));
    if (!id.success)
      return json({ error: 'Please refresh the page and try again.' }, 400);
    const parsed = inquirySchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success)
      return json(
        {
          error: 'Please check the highlighted fields.',
          fields: z.flattenError(parsed.error).fieldErrors,
        },
        422,
      );
    const db = getDatabase();
    const existing = await db
      .prepare('SELECT id FROM inquiries WHERE id = ?')
      .bind(id.data)
      .first<{ id: string }>();
    if (existing) return json({ id: existing.id, received: true });
    const photos = form
      .getAll('photos')
      .filter((file): file is File => file instanceof File && file.size > 0);
    if (
      photos.length > photoLimits.count ||
      photos.reduce((sum, file) => sum + file.size, 0) > photoLimits.total
    )
      return json(
        { error: 'Choose up to 4 photos, no more than 15 MB in total.' },
        422,
      );
    const validated = [];
    for (const file of photos) {
      if (!photoTypes.includes(file.type) || file.size > photoLimits.each)
        return json(
          { error: 'Photos must be JPG, PNG, WebP, or AVIF, up to 5 MB each.' },
          422,
        );
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!imageSignature(bytes, file.type))
        return json(
          {
            error:
              'One of your photos could not be read. Please choose a JPG, PNG, WebP, or AVIF image.',
          },
          422,
        );
      validated.push({ file, bytes });
    }
    const storedPhotos = [];
    for (const { file, bytes } of validated) {
      const key = `inquiries/${id.data}/${crypto.randomUUID()}`;
      await getPhotoStorage().put(key, bytes, {
        httpMetadata: { contentType: file.type },
      });
      uploaded.push(key);
      storedPhotos.push({
        key,
        name: file.name.slice(0, 200),
        type: file.type,
        size: file.size,
      });
    }
    const details = parsed.data;
    const createdAt = Date.now();
    const [result] = await db.batch([
      db
        .prepare(
          'INSERT OR IGNORE INTO inquiries (id, created_at, name, email, service, details, photos) VALUES (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          id.data,
          createdAt,
          details.name,
          details.email,
          details.service,
          JSON.stringify(details),
          JSON.stringify(storedPhotos),
        ),
      db
        .prepare(
          `INSERT OR IGNORE INTO inquiry_deliveries
           (inquiry_id, created_at, desktop_enabled, email_status,
            email_attempts, email_next_attempt_at, email_lease_until)
           VALUES (?, ?, 1, 'pending', 0, 0, 0)`,
        )
        .bind(id.data, createdAt),
    ]);
    committed = Boolean(result.meta.changes);
    if (!result.meta.changes && uploaded.length)
      await getPhotoStorage().delete(uploaded);
    if (committed)
      try {
        after(() => drainInquiryEmails({ onlyId: id.data, limit: 1 }));
      } catch {
        // The saved inquiry remains queued for the scheduled delivery worker.
      }
    return json(
      { id: id.data, received: true },
      result.meta.changes ? 201 : 200,
    );
  } catch (error) {
    if (!committed && uploaded.length)
      await getPhotoStorage()
        .delete(uploaded)
        .catch(() => undefined);
    if (error instanceof TypeError)
      return json(
        {
          error:
            'We could not read your inquiry. Please check your details and try again.',
        },
        400,
      );
    console.error(
      'Inquiry submission failed',
      error instanceof Error ? error.name : 'UnknownError',
    );
    return json(
      {
        error:
          'Your inquiry could not be saved just yet. Your details are still here; please try again.',
      },
      503,
    );
  }
}
