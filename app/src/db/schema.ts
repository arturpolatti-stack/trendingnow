import { boolean, doublePrecision, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Toda tabela tem store_id e toda consulta o filtra no servidor (INV-01).
 * As chaves primárias são globais (uuid ou ids derivados de uuid); a posse é
 * verificada nos repositórios, nunca confiada ao cliente.
 */
export const storeProfiles = pgTable("store_profiles", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  name: text("name").notNull(),
  market: text("market").notNull(),
  categories: text("categories").notNull(),
  capacity: text("capacity").notNull(),
  maxEffortHours: doublePrecision("max_effort_hours"),
}, (t) => [index("store_profiles_store_idx").on(t.storeId)]);

export const opportunities = pgTable("opportunities", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  product: text("product").notNull(),
  audience: text("audience").notNull(),
  occasion: text("occasion").notNull(),
  style: text("style").notNull(),
  format: text("format").notNull(),
  language: text("language").notNull(),
  market: text("market").notNull(),
}, (t) => [index("opportunities_store_idx").on(t.storeId)]);

/** Proveniência de DATA-03: o valor é jsonb porque pode ser número, texto ou estado de ausência. */
export const observations = pgTable("observations", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  opportunityId: text("opportunity_id").notNull(),
  dimension: text("dimension").notNull(),
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
  term: text("term").notNull(),
  metric: text("metric").notNull(),
  unit: text("unit").notNull(),
  value: jsonb("value").notNull(),
  country: text("country").notNull(),
  language: text("language").notNull(),
  periodStart: text("period_start"),
  periodEnd: text("period_end"),
  collectedAt: timestamp("collected_at", { withTimezone: true, mode: "string" }).notNull(),
  method: text("method").notNull(),
  normalization: text("normalization"),
}, (t) => [index("observations_store_opp_idx").on(t.storeId, t.opportunityId)]);

export const decisions = pgTable("decisions", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  opportunityId: text("opportunity_id").notNull(),
  kind: text("kind").notNull(),
  reason: text("reason").notNull(),
  stage: text("stage"),
  missingEvidence: text("missing_evidence"),
  decidedAt: timestamp("decided_at", { withTimezone: true, mode: "string" }).notNull(),
}, (t) => [index("decisions_store_idx").on(t.storeId)]);

export const briefings = pgTable("briefings", {
  id: text("id").primaryKey(),
  storeId: text("store_id").notNull(),
  opportunityId: text("opportunity_id").notNull(),
  fields: jsonb("fields").notNull(),
  reasons: jsonb("reasons").notNull(),
  uncertainty: jsonb("uncertainty").notNull(),
}, (t) => [index("briefings_store_idx").on(t.storeId)]);

/** Tabelas do Better Auth (esquema central). Cada usuário é o dono de uma loja: storeId = user.id. */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (t) => [index("session_user_idx").on(t.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("account_user_idx").on(t.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)]);
