import type { Observation } from "./types";

export class ValidationError extends Error {}

const REQUIRED_TEXT = [
  "id",
  "storeId",
  "opportunityId",
  "source",
  "sourceUrl",
  "term",
  "metric",
  "unit",
  "country",
  "language",
  "collectedAt",
] as const;

/** Valida a proveniência mínima (DATA-03) e a semântica de ausência (DATA-06). */
export function validateObservation(o: Observation): void {
  for (const key of REQUIRED_TEXT) {
    if (typeof o[key] !== "string" || o[key].trim() === "") {
      throw new ValidationError(`Observação sem ${key}`);
    }
  }
  if (Number.isNaN(Date.parse(o.collectedAt))) {
    throw new ValidationError("collectedAt inválido");
  }
  if (o.value.kind === "number" && !Number.isFinite(o.value.value)) {
    throw new ValidationError("Valor numérico inválido");
  }
  if (o.value.kind === "number") {
    // Um número precisa de período medido; o instante da coleta não o substitui.
    if (!o.periodStart || !o.periodEnd) {
      throw new ValidationError("Valor numérico exige período medido");
    }
    if (Date.parse(o.periodStart) > Date.parse(o.periodEnd)) {
      throw new ValidationError("Período invertido");
    }
  }
  if (o.unit.toLowerCase().includes("relative") && !o.normalization) {
    throw new ValidationError("Dado relativo exige regra de normalização");
  }
}

export interface ComparisonVerdict {
  comparable: boolean;
  reason?: string;
}

/** DATA-05: só compara séries compatíveis; nunca converte índice em volume. */
export function compareObservations(a: Observation, b: Observation): ComparisonVerdict {
  if (a.dimension !== b.dimension) return { comparable: false, reason: "dimensões diferentes" };
  if (a.country !== b.country || a.language !== b.language) {
    return { comparable: false, reason: "mercado ou idioma diferentes" };
  }
  if (a.unit !== b.unit || a.metric !== b.metric) {
    return { comparable: false, reason: "métrica ou unidade diferentes" };
  }
  if (a.periodStart !== b.periodStart || a.periodEnd !== b.periodEnd) {
    return { comparable: false, reason: "períodos diferentes" };
  }
  if (a.unit.toLowerCase().includes("relative") && a.normalization !== b.normalization) {
    return { comparable: false, reason: "normalizações independentes" };
  }
  if (a.value.kind !== "number" || b.value.kind !== "number") {
    return { comparable: false, reason: "valor ausente" };
  }
  return { comparable: true };
}
