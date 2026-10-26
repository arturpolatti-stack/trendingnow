export type StoreId = string;

/** Dimensões separadas por DATA-04: nunca somar nem converter entre elas. */
export type Dimension = "attention" | "demand" | "supply";

/** Estados de ausência de DATA-06. Ausência nunca é representada por 0. */
export type AbsenceState =
  | "not_collected"
  | "unavailable"
  | "insufficient_sample"
  | "stale"
  | "source_error";

export type ObservationValue =
  | { kind: "number"; value: number } // inclui zero observado
  | { kind: "text"; value: string }
  | { kind: "absent"; state: AbsenceState };

/** Proveniência exigida por DATA-03. */
export interface Observation {
  id: string;
  storeId: StoreId;
  opportunityId: string;
  dimension: Dimension;
  source: string;
  sourceUrl: string;
  term: string;
  metric: string;
  unit: string;
  value: ObservationValue;
  country: string;
  language: string;
  /** Período medido (não confundir com o instante da coleta). */
  periodStart?: string;
  periodEnd?: string;
  collectedAt: string;
  method: "manual" | "automatic";
  /** Para dados relativos: grupo e regra de normalização conhecidos. */
  normalization?: string;
}

export interface Opportunity {
  id: string;
  storeId: StoreId;
  product: string;
  audience: string;
  occasion: string;
  style: string;
  format: string;
  language: string;
  market: string;
}

export const BRIEFING_FIELDS = [
  "audience",
  "occasion",
  "need",
  "bundleProposal",
  "differentiation",
  "formats",
  "editableFields",
  "delivery",
  "keywords",
  "effort",
  "completionCriteria",
] as const;
export type BriefingField = (typeof BRIEFING_FIELDS)[number];

export interface Briefing {
  id: string;
  storeId: StoreId;
  opportunityId: string;
  fields: Record<BriefingField, string>;
  /** Razões e incertezas citam IDs de observações. */
  reasons: { text: string; evidenceIds: string[] }[];
  uncertainty: { text: string; evidenceIds: string[] };
}
