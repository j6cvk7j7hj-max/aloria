import { z } from 'zod';
import { getDatabase, getPhotoStorage } from '@/db';
import { inquirySchema, photoLimits, photoTypes } from '@/lib/inquiry';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
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
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin)
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
    const result = await db
      .prepare(
        'INSERT OR IGNORE INTO inquiries (id, created_at, name, email, service, details, photos) VALUES (?, ?, ?, ?, ?, ?, ?)',
      )
      .bind(
        id.data,
        Date.now(),
        details.name,
        details.email,
        details.service,
        JSON.stringify(details),
        JSON.stringify(storedPhotos),
      )
      .run();
    if (!result.meta.changes && uploaded.length)
      await getPhotoStorage().delete(uploaded);
    return json(
      { id: id.data, received: true },
      result.meta.changes ? 201 : 200,
    );
  } catch (error) {
    if (uploaded.length)
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
