import { getDatabase } from '@/db';
import { isOwner, privateHeaders } from '@/lib/server/owner-auth';

const nonClientTestIds = [
  'ceba934d-ca8e-4cd0-8aab-b76fa7755abe',
  'd949c1ba-b867-4b58-bbc3-e2830f6a5c68',
];

export async function POST(request: Request) {
  if (!(await isOwner(request)))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401, headers: privateHeaders() },
    );
  const result = await getDatabase()
    .prepare(
      `INSERT OR IGNORE INTO inquiry_deliveries
       (inquiry_id, created_at, desktop_enabled, email_status,
        email_attempts, email_next_attempt_at, email_lease_until)
       SELECT id, created_at,
         CASE WHEN id IN (?, ?) THEN 0 ELSE 1 END,
         'not_requested', 0, 0, 0
       FROM inquiries`,
    )
    .bind(...nonClientTestIds)
    .run();
  return Response.json(
    { registered: result.meta.changes },
    { headers: privateHeaders() },
  );
}
