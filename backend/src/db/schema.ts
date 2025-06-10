import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const urls = pgTable('urls', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 64 }).unique().notNull(),
    targetUrl: text('target_url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  });