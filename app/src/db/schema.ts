import { doublePrecision, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
