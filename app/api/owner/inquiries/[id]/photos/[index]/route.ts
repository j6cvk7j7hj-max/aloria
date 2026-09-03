import { getDatabase, getPhotoStorage } from '@/db';
import { parseJson, type StoredPhoto } from '@/lib/inquiry-record';
import { isOwner, privateHeaders } from '@/lib/server/owner-auth';

function safeFilename(value: string) {
  return (
    value
      .normalize('NFKC')
      .replace(/[\p{Cc}"\\/]/gu, '_')
      .slice(0, 160) || 'project-photo'
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; index: string }> },
) {
  if (!(await isOwner(request)))
    return new Response('Unauthorized', {
      status: 401,
      headers: privateHeaders('text/plain; charset=utf-8'),
    });
  const { id, index: rawIndex } = await context.params;
  const index = Number.parseInt(rawIndex, 10);
  if (!Number.isSafeInteger(index) || index < 0)
    return new Response('Not found', {
      status: 404,
      headers: privateHeaders('text/plain; charset=utf-8'),
    });
  const row = await getDatabase()
    .prepare('SELECT photos FROM inquiries WHERE id = ?')
    .bind(id)
    .first<{ photos: string }>();
  const photo = row
    ? parseJson<StoredPhoto[]>(row.photos, [])[index]
    : undefined;
  if (!photo)
    return new Response('Not found', {
      status: 404,
      headers: privateHeaders('text/plain; charset=utf-8'),
    });
  const object = await getPhotoStorage().get(photo.key);
  if (!object)
    return new Response('Not found', {
      status: 404,
      headers: privateHeaders('text/plain; charset=utf-8'),
    });
  const filename = safeFilename(photo.name);
  const headers = new Headers(privateHeaders(photo.type));
  headers.set(
    'Content-Disposition',
    `attachment; filename="project-photo"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  headers.set('Content-Length', String(photo.size));
  return new Response(object.body, { headers });
}
