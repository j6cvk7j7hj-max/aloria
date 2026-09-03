import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  service: text('service').notNull(),
  details: text('details', { mode: 'json' }).notNull(),
  photos: text('photos', { mode: 'json' }).notNull(),
});

export const inquiryDeliveries = sqliteTable(
  'inquiry_deliveries',
  {
    sequence: integer('sequence').primaryKey({ autoIncrement: true }),
    inquiryId: text('inquiry_id')
      .notNull()
      .unique()
      .references(() => inquiries.id),
    createdAt: integer('created_at').notNull(),
    desktopEnabled: integer('desktop_enabled').notNull().default(1),
    emailStatus: text('email_status').notNull().default('pending'),
    emailAttempts: integer('email_attempts').notNull().default(0),
    emailNextAttemptAt: integer('email_next_attempt_at').notNull().default(0),
    emailLeaseUntil: integer('email_lease_until').notNull().default(0),
    emailPayload: text('email_payload'),
    emailProviderId: text('email_provider_id'),
    emailSentAt: integer('email_sent_at'),
    emailLastError: text('email_last_error'),
  },
  (table) => [
    index('inquiry_delivery_queue_idx').on(
      table.emailStatus,
      table.emailNextAttemptAt,
    ),
  ],
);
