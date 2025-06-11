import { pgTable, serial, text, timestamp, varchar, uuid, boolean, pgEnum } from "drizzle-orm/pg-core";

export const roles = pgEnum('roles', ['admin', 'user']);

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    fullname: varchar('fullname', { length: 255 }).notNull(),
    username: varchar('username', { length: 64 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: roles('role').notNull().default('user'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isActive: boolean('is_active').notNull().default(true),
  });

export const urls = pgTable('urls', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 64 }).unique().notNull(),
    targetUrl: text('target_url').notNull(),
    userId: uuid('user_id').references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
    }),
    passwordProtected: boolean('password_protected').notNull().default(false),
    passwordHash: varchar('password_hash', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });