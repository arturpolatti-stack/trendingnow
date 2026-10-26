import { describe, expect, it } from "vitest";
import { validateBriefing } from "@/domain/briefing";
import { ValidationError } from "@/domain/evidence";
import { parseBriefingForm, parseDecisionForm, parseProfileForm } from "@/domain/forms";
import { BRIEFING_FIELDS } from "@/domain/types";
import { obs } from "./helpers";

class Form {
  constructor(private d: Record<string, string | string[]>) {}
  get(n: string) { const v = this.d[n]; return Array.isArray(v) ? (v[0] ?? null) : (v ?? null); }
  getAll(n: string) { const v = this.d[n]; return v === undefined ? [] : Array.isArray(v) ? v : [v]; }
}
const f = (d: Record<string, string | string[]>) => new Form(d) as unknown as FormData;

describe("decisão (R-06)", () => {
  it("escolher inicia na etapa 'chosen'; adiar e rejeitar não têm etapa", () => {
    expect(parseDecisionForm(f({ kind: "choose", reason: "r" }), "A", "o1").stage).toBe("chosen");
    expect(parseDecisionForm(f({ kind: "reject", reason: "r" }), "A", "o1").stage).toBeUndefined();
  });
  it("adiar exige a evidência que falta; todo caso exige motivo", () => {
    expect(() => parseDecisionForm(f({ kind: "postpone", reason: "r" }), "A", "o1")).toThrow(ValidationError);
    expect(() => parseDecisionForm(f({ kind: "choose", reason: " " }), "A", "o1")).toThrow(ValidationError);
    expect(parseDecisionForm(f({ kind: "postpone", reason: "r", missingEvidence: "buscas" }), "A", "o1").missingEvidence).toBe("buscas");
  });
});

describe("briefing a partir do formulário", () => {
  const filled = Object.fromEntries(BRIEFING_FIELDS.map((k) => [k, "x"]));
  const data = { ...filled, reason1: "a", reason1Ev: ["e1"], reason2: "b", reason2Ev: ["e1"], uncertainty: "u", uncertaintyEv: ["e1"] };
  const observations = [obs("A", "e1")];

  it("briefing completo e com evidências válidas é aceito", () => {
    expect(() => validateBriefing(parseBriefingForm(f(data) as never, "A", "o1"), observations)).not.toThrow();
  });
  it("evidência forjada no formulário é rejeitada", () => {
    const b = parseBriefingForm(f({ ...data, reason1Ev: ["forjado"] }) as never, "A", "o1");
    expect(() => validateBriefing(b, observations)).toThrow(/inexistente/);
  });
  it("briefing vazio é rejeitado", () => {
    expect(() => validateBriefing(parseBriefingForm(f({}) as never, "A", "o1"), observations)).toThrow(ValidationError);
  });
});

describe("perfil da loja", () => {
  it("exige nome; esforço opcional mas positivo", () => {
    expect(() => parseProfileForm(f({}), "A")).toThrow(ValidationError);
    expect(() => parseProfileForm(f({ name: "n", maxEffortHours: "-1" }), "A")).toThrow(ValidationError);
    expect(parseProfileForm(f({ name: "n" }), "A").maxEffortHours).toBeNull();
  });
});
