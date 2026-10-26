import { ValidationError } from "./evidence";
import { BRIEFING_FIELDS, type Briefing, type Observation } from "./types";

/**
 * Valida um briefing contra as observações da própria loja (R-05, INV-02, INV-03):
 * campos mínimos preenchidos, ≥2 razões e uma incerteza, e toda citação aponta
 * para uma observação existente — inclusive quando o texto veio de IA ou de fonte externa.
 */
export function validateBriefing(b: Briefing, observations: Observation[]): void {
  const known = new Set(
    observations.filter((o) => o.storeId === b.storeId && o.opportunityId === b.opportunityId).map((o) => o.id),
  );
  for (const f of BRIEFING_FIELDS) {
    if (!b.fields[f] || b.fields[f].trim() === "") throw new ValidationError(`Campo obrigatório ausente: ${f}`);
  }
  if (b.reasons.length < 2) throw new ValidationError("São necessárias ao menos duas razões");
  for (const item of [...b.reasons, b.uncertainty]) {
    if (item.text.trim() === "" || item.evidenceIds.length === 0) {
      throw new ValidationError("Razão ou incerteza sem evidência citada");
    }
    for (const id of item.evidenceIds) {
      if (!known.has(id)) throw new ValidationError(`Evidência inexistente: ${id}`);
    }
  }
}

/** Isola texto de fontes/feedback como dado em prompts (INV-03). */
export function wrapUntrusted(label: string, text: string): string {
  const safe = text.replaceAll("</untrusted>", "<\\/untrusted>");
  return `<untrusted source="${label.replace(/[^\w .-]/g, "")}">\n${safe}\n</untrusted>`;
}
