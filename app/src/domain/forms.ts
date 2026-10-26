import { ValidationError, validateObservation } from "./evidence";
import type { AbsenceState, Dimension, Observation, ObservationValue, Opportunity } from "./types";

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
