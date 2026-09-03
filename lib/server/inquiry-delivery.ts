import { env } from 'cloudflare:workers';
import { getDatabase } from '@/db';
import {
  serviceName,
  storedInquiryFromRow,
  type StoredInquiry,
} from '@/lib/inquiry-record';

type DeliveryRow = {
  sequence: number;
  inquiry_id: string;
  email_attempts: number;
  email_payload: string | null;
  id: string;
  created_at: number;
  name: string;
  email: string;
  service: string;
  details: string;
  photos: string;
};

type FrozenEmail = {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
};

const labels: Record<string, string> = {
  location: 'Client location',
  room: 'Room / job',
  dimensions: 'Approximate dimensions',
  budget: 'Budget range',
  timeline: 'Desired timeline',
  description: 'Project description',
  ceiling: 'Ceiling height',
  windows: 'Window dimensions',
  doors: 'Door dimensions',
  doorSwing: 'Door swing directions',
  outlets: 'Outlets or fixed features',
  furniture: 'Existing furniture',
  style: 'Preferred styles',
  roomUse: 'How the room is used',
  occupants: 'People using the room',
  inspiration: 'Inspiration / Pinterest',
  colorsLove: 'Colors loved',
  colorsAvoid: 'Colors to avoid',
  keep: 'Elements that must remain',
};

function cleanSubject(value: string) {
  return value
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .slice(0, 100);
}

function buildEmail(inquiry: StoredInquiry): FrozenEmail {
  const details = inquiry.details;
  const answers = Object.entries(labels)
    .map(([key, label]) => [label, details[key as keyof typeof details]])
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([label, value]) => `${label}:\n${String(value).trim()}`)
    .join('\n\n');
  const photos = inquiry.photos.length
    ? inquiry.photos
        .map(
          (photo, index) =>
            `${index + 1}. ${photo.name} (${photo.type}, ${Math.ceil(photo.size / 1024)} KB)`,
        )
        .join('\n')
    : 'No photos were attached.';
  const room = cleanSubject(details.room || 'New project');
  const name = cleanSubject(inquiry.name || 'New client');
  return {
    from: env.INQUIRY_EMAIL_FROM || '',
    to: [env.INQUIRY_EMAIL_TO || ''],
    reply_to: inquiry.email,
    subject: `New Aloria inquiry — ${name} — ${room}`,
    text: [
      'A new project inquiry was saved on AloriaDesign.com.',
      '',
      `Client: ${inquiry.name}`,
      `Client email: ${inquiry.email}`,
      `Service: ${serviceName(inquiry.service)}`,
      `Received: ${new Date(inquiry.createdAt).toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'long', timeStyle: 'short' })} ET`,
      `Inquiry ID: ${inquiry.id}`,
      '',
      answers,
      '',
      `Photos (${inquiry.photos.length}):`,
      photos,
      '',
      'Original photos are stored privately and will copy to the Aloria Inquiries folder on Mia’s Mac when it is awake and online.',
      'Reply to this email to respond directly to the client.',
    ].join('\n'),
  };
}

export function emailIsConfigured() {
  return Boolean(
    env.RESEND_API_KEY && env.INQUIRY_EMAIL_FROM && env.INQUIRY_EMAIL_TO,
  );
}

function retryDelay(attempt: number) {
  const minutes = Math.min(360, 5 * 2 ** Math.min(attempt, 7));
  return minutes * 60_000 + Math.floor(Math.random() * 30_000);
}

async function sendEmail(payload: FrozenEmail, inquiryId: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `aloria-inquiry/${inquiryId}`,
      'User-Agent': 'Aloria-Inquiry-Delivery/1.0',
    },
    body: JSON.stringify(payload),
  });
  const responseBody = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    name?: string;
  };
  if (!response.ok || !responseBody.id)
    throw new Error(
      `${response.status} ${responseBody.name || 'ResendError'}: ${responseBody.message || 'Email provider rejected the request'}`,
    );
  return responseBody.id;
}

export async function drainInquiryEmails(
  options: {
    onlyId?: string;
    limit?: number;
  } = {},
) {
  if (!emailIsConfigured())
    return { configured: false, delivered: 0, deferred: 0 };
  const db = getDatabase();
  const now = Date.now();
  const limit = Math.max(1, Math.min(options.limit || 8, 25));
  const onlyClause = options.onlyId ? 'AND d.inquiry_id = ?' : '';
  const statement = db.prepare(
    `SELECT d.sequence, d.inquiry_id, d.email_attempts, d.email_payload,
      i.id, i.created_at, i.name, i.email, i.service, i.details, i.photos
     FROM inquiry_deliveries d
     JOIN inquiries i ON i.id = d.inquiry_id
     WHERE d.email_status IN ('pending', 'retry')
       AND d.email_next_attempt_at <= ?
       AND d.email_lease_until <= ?
       ${onlyClause}
     ORDER BY d.sequence ASC
     LIMIT ?`,
  );
  const bound = options.onlyId
    ? statement.bind(now, now, options.onlyId, limit)
    : statement.bind(now, now, limit);
  const candidates = await bound.all<DeliveryRow>();
  let delivered = 0;
  let deferred = 0;
  for (const row of candidates.results) {
    const leaseUntil = Date.now() + 2 * 60_000;
    const claim = await db
      .prepare(
        `UPDATE inquiry_deliveries
         SET email_status = 'sending', email_lease_until = ?
         WHERE inquiry_id = ?
           AND email_status IN ('pending', 'retry')
           AND email_lease_until <= ?`,
      )
      .bind(leaseUntil, row.inquiry_id, Date.now())
      .run();
    if (!claim.meta.changes) continue;
    const inquiry = storedInquiryFromRow(row);
    const payload = row.email_payload
      ? (JSON.parse(row.email_payload) as FrozenEmail)
      : buildEmail(inquiry);
    if (!row.email_payload)
      await db
        .prepare(
          'UPDATE inquiry_deliveries SET email_payload = ? WHERE inquiry_id = ?',
        )
        .bind(JSON.stringify(payload), row.inquiry_id)
        .run();
    try {
      const providerId = await sendEmail(payload, row.inquiry_id);
      await db
        .prepare(
          `UPDATE inquiry_deliveries
           SET email_status = 'sent', email_sent_at = ?, email_provider_id = ?,
               email_lease_until = 0, email_last_error = NULL
           WHERE inquiry_id = ?`,
        )
        .bind(Date.now(), providerId, row.inquiry_id)
        .run();
      delivered += 1;
    } catch (error) {
      const attempt = row.email_attempts + 1;
      const message =
        error instanceof Error ? error.message.slice(0, 400) : 'EmailError';
      await db
        .prepare(
          `UPDATE inquiry_deliveries
           SET email_status = 'retry', email_attempts = ?,
               email_next_attempt_at = ?, email_lease_until = 0,
               email_last_error = ?
           WHERE inquiry_id = ?`,
        )
        .bind(
          attempt,
          Date.now() + retryDelay(attempt),
          message,
          row.inquiry_id,
        )
        .run();
      deferred += 1;
    }
  }
  return { configured: true, delivered, deferred };
}
