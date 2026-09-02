import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  service: text('service').notNull(),
  details: text('details', { mode: 'json' }).notNull(),
  photos: text('photos', { mode: 'json' }).notNull(),
});
