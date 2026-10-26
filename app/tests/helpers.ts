import type { Briefing, Observation, Opportunity } from "@/domain/types";

export const opp = (storeId: string, id = "o1"): Opportunity => ({
  id, storeId, product: "bundle", audience: "brides", occasion: "bachelorette",
  style: "boho", format: "canva", language: "en", market: "US",
});

export const obs = (storeId: string, id = "e1", over: Partial<Observation> = {}): Observation => ({
  id, storeId, opportunityId: "o1", dimension: "demand", source: "etsy-insights",
  sourceUrl: "https://example.test/src", term: "bachelorette bundle", metric: "searches",
  unit: "count", value: { kind: "number", value: 120 }, country: "US", language: "en",
  periodStart: "2026-09-26", periodEnd: "2026-10-25", collectedAt: "2026-10-26T10:00:00.000Z",
  method: "manual", ...over,
});

export const briefing = (storeId: string, ids: string[]): Briefing => ({
  id: "b1", storeId, opportunityId: "o1",
  fields: {
    audience: "a", occasion: "b", need: "c", bundleProposal: "d", differentiation: "e",
    formats: "f", editableFields: "g", delivery: "h", keywords: "i", effort: "j", completionCriteria: "k",
  },
  reasons: [{ text: "r1", evidenceIds: ids }, { text: "r2", evidenceIds: ids }],
  uncertainty: { text: "u", evidenceIds: ids },
});
