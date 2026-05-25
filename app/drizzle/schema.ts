import { pgTable, varchar, numeric, boolean, integer, text, timestamp, unique, serial } from 'drizzle-orm/pg-core'

export const locations = pgTable('locations', {
  slug: varchar('slug', { length: 32 }).primaryKey(), // brighton | nashua | orem
  name: varchar('name', { length: 128 }).notNull(),
})

export const metricValues = pgTable('metric_values', {
  id: serial('id').primaryKey(),
  location: varchar('location', { length: 32 }).notNull(),
  periodGrain: varchar('period_grain', { length: 8 }).notNull().default('month'), // month | week
  periodLabel: varchar('period_label', { length: 32 }).notNull(), // e.g. "Apr 2026", "May 1–7"
  periodStart: varchar('period_start', { length: 16 }), // ISO date YYYY-MM-DD
  metricKey: varchar('metric_key', { length: 64 }).notNull(),
  value: numeric('value', { precision: 14, scale: 4 }),
  isPartial: boolean('is_partial').notNull().default(false),
  daysComplete: integer('days_complete'),
  daysInMonth: integer('days_in_month'),
  isRatio: boolean('is_ratio').notNull().default(false),
}, (t) => [
  unique().on(t.location, t.periodGrain, t.periodLabel, t.metricKey),
])

export const detailLists = pgTable('detail_lists', {
  id: serial('id').primaryKey(),
  location: varchar('location', { length: 32 }).notNull(),
  periodLabel: varchar('period_label', { length: 32 }).notNull(),
  listType: varchar('list_type', { length: 64 }).notNull(),
  rank: integer('rank').notNull(),
  name: varchar('name', { length: 256 }),
  value: numeric('value', { precision: 14, scale: 4 }),
  secondaryValue: numeric('secondary_value', { precision: 14, scale: 4 }),
}, (t) => [
  unique().on(t.location, t.periodLabel, t.listType, t.rank),
])

export const dimensionValues = pgTable('dimension_values', {
  id: serial('id').primaryKey(),
  location: varchar('location', { length: 32 }).notNull(),
  periodLabel: varchar('period_label', { length: 32 }).notNull(),
  dimensionType: varchar('dimension_type', { length: 64 }).notNull(),
  dimensionKey: varchar('dimension_key', { length: 64 }).notNull(),
  value: numeric('value', { precision: 14, scale: 4 }),
  isRatio: boolean('is_ratio').notNull().default(false),
}, (t) => [
  unique().on(t.location, t.periodLabel, t.dimensionType, t.dimensionKey),
])

export const uploadLog = pgTable('upload_log', {
  id: serial('id').primaryKey(),
  location: varchar('location', { length: 32 }).notNull(),
  templateType: varchar('template_type', { length: 32 }).notNull(),
  periodLabel: varchar('period_label', { length: 32 }),
  uploadedBy: varchar('uploaded_by', { length: 256 }),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
  rowCount: integer('row_count'),
})
