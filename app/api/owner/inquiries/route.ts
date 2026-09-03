import { env } from 'cloudflare:workers';
import { getDatabase } from '@/db';
import { storedInquiryFromRow } from '@/lib/inquiry-record';
import { emailIsConfigured } from '@/lib/server/inquiry-delivery';
import { isOwner, privateHeaders } from '@/lib/server/owner-auth';

type FeedRow = {
  sequence: number;
  email_status: string;
  email_sent_at: number | null;
  id: string;
  created_at: number;
  name: string;
  email: string;
  service: string;
  details: string;
  photos: string;
};

export async function GET(request: Request) {
  if (!(await isOwner(request)))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401, headers: privateHeaders() },
    );
  const url = new URL(request.url);
  const after = Number.parseInt(url.searchParams.get('after') || '0', 10);
  const requestedLimit = Number.parseInt(
    url.searchParams.get('limit') || '25',
    10,
  );
  if (!Number.isSafeInteger(after) || after < 0)
    return Response.json(
      { error: 'Invalid cursor' },
      { status: 400, headers: privateHeaders() },
    );
  const limit = Math.max(
    1,
    Math.min(Number.isFinite(requestedLimit) ? requestedLimit : 25, 100),
  );
  const result = await getDatabase()
    .prepare(
      `SELECT d.sequence, d.email_status, d.email_sent_at,
        i.id, i.created_at, i.name, i.email, i.service, i.details, i.photos
       FROM inquiry_deliveries d
       JOIN inquiries i ON i.id = d.inquiry_id
       WHERE d.desktop_enabled = 1 AND d.sequence > ?
       ORDER BY d.sequence ASC
       LIMIT ?`,
    )
    .bind(after, limit)
    .all<FeedRow>();
  const inquiries = result.results.map((row) => ({
    sequence: row.sequence,
    ...storedInquiryFromRow(row),
    emailStatus: row.email_status,
    emailSentAt: row.email_sent_at,
  }));
  return Response.json(
    {
      inquiries,
      nextAfter: inquiries.at(-1)?.sequence || after,
      hasMore: inquiries.length === limit,
      emailConfigured: emailIsConfigured(),
      destination: env.INQUIRY_EMAIL_TO || 'mia@aloriadesign.com',
    },
    { headers: privateHeaders() },
  );
}
