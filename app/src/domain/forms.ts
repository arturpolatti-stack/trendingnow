import { ValidationError, validateObservation } from "./evidence";
import {
  BRIEFING_FIELDS,
  type AbsenceState, type Briefing, type Decision, type DecisionKind, type Dimension,
  type Observation, type ObservationValue, type Opportunity, type StoreProfile,
} from "./types";

type Fields = { get(name: string): FormDataEntryValue | null };

const text = (f: Fields, name: string): string => {
  const v = f.get(name);
  return typeof v === "string" ? v.trim() : "";
};

const ABSENCE: AbsenceState[] = ["not_collected", "unavailable", "insufficient_sample", "stale", "source_error"];
const DIMENSIONS: Dimension[] = ["attention", "demand", "supply"];

export function parseOpportunityForm(f: Fields, storeId: string, id: string): Opportunity {
  const o: Opportunity = {
    id, storeId,
    product: text(f, "product"), audience: text(f, "audience"), occasion: text(f, "occasion"),
    style: text(f, "style"), format: text(f, "format"),
    language: text(f, "language") || "en", market: text(f, "market") || "US",
  };
  for (const k of ["product", "audience", "occasion"] as const) {
    if (!o[k]) throw new ValidationError(`Campo obrigatório: ${k}`);
  }
  return o;
}

/** Converte o formulário de curadoria manual em observação validada (DATA-03/06). */
export function parseObservationForm(f: Fields, storeId: string, opportunityId: string, id: string): Observation {
  const dimension = text(f, "dimension") as Dimension;
  if (!DIMENSIONS.includes(dimension)) throw new ValidationError("Dimensão inválida");

  const kind = text(f, "valueKind");
  let value: ObservationValue;
  if (kind === "number") {
    const raw = text(f, "number");
    if (raw === "" || !Number.isFinite(Number(raw))) throw new ValidationError("Informe um número ou escolha um estado de ausência");
    value = { kind: "number", value: Number(raw) };
  } else if (kind === "text") {
    if (!text(f, "text")) throw new ValidationError("Informe o texto observado");
    value = { kind: "text", value: text(f, "text") };
  } else if (ABSENCE.includes(kind as AbsenceState)) {
    value = { kind: "absent", state: kind as AbsenceState };
  } else {
    throw new ValidationError("Tipo de valor inválido");
  }

  const obs: Observation = {
    id, storeId, opportunityId, dimension,
    source: text(f, "source"), sourceUrl: text(f, "sourceUrl"), term: text(f, "term"),
    metric: text(f, "metric"), unit: text(f, "unit"), value,
    country: text(f, "country") || "US", language: text(f, "language") || "en",
    periodStart: text(f, "periodStart") || undefined, periodEnd: text(f, "periodEnd") || undefined,
    collectedAt: new Date().toISOString(), method: "manual",
    normalization: text(f, "normalization") || undefined,
  };
  validateObservation(obs);
  return obs;
}

export function parseProfileForm(f: Fields, storeId: string): StoreProfile {
  const hours = text(f, "maxEffortHours");
  if (hours !== "" && (!Number.isFinite(Number(hours)) || Number(hours) <= 0)) {
    throw new ValidationError("Esforço máximo deve ser um número positivo");
  }
  const p: StoreProfile = {
    id: storeId, storeId, name: text(f, "name"), market: text(f, "market") || "US",
    categories: text(f, "categories"), capacity: text(f, "capacity"),
    maxEffortHours: hours === "" ? null : Number(hours),
  };
  if (!p.name) throw new ValidationError("Informe o nome da loja");
  return p;
}

export function parseDecisionForm(f: Fields, storeId: string, opportunityId: string): Decision {
  const kind = text(f, "kind") as DecisionKind;
  if (!["choose", "postpone", "reject"].includes(kind)) throw new ValidationError("Decisão inválida");
  const reason = text(f, "reason");
  if (!reason) throw new ValidationError("Registre o motivo da decisão");
  const missingEvidence = text(f, "missingEvidence");
  if (kind === "postpone" && !missingEvidence) throw new ValidationError("Adiar exige dizer qual evidência falta");
  return {
    id: `d-${opportunityId}`, storeId, opportunityId, kind, reason,
    stage: kind === "choose" ? "chosen" : undefined,
    missingEvidence: kind === "postpone" ? missingEvidence : undefined,
    decidedAt: new Date().toISOString(),
  };
}

type ListFields = Fields & { getAll(name: string): FormDataEntryValue[] };
const ids = (f: ListFields, name: string) => f.getAll(name).filter((v): v is string => typeof v === "string");

export function parseBriefingForm(f: ListFields, storeId: string, opportunityId: string): Briefing {
  const fields = Object.fromEntries(BRIEFING_FIELDS.map((k) => [k, text(f, k)])) as Briefing["fields"];
  return {
    id: `b-${opportunityId}`, storeId, opportunityId, fields,
    reasons: [1, 2].map((n) => ({ text: text(f, `reason${n}`), evidenceIds: ids(f, `reason${n}Ev`) })),
    uncertainty: { text: text(f, "uncertainty"), evidenceIds: ids(f, "uncertaintyEv") },
  };
}
