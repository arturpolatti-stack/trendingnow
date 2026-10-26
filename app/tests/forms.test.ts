import { describe, expect, it } from "vitest";
import { ValidationError } from "@/domain/evidence";
import { parseObservationForm, parseOpportunityForm } from "@/domain/forms";

const form = (o: Record<string, string>) => new Map(Object.entries(o)) as unknown as FormData;
const base = {
  dimension: "demand", source: "Etsy", sourceUrl: "https://x.test", term: "t", metric: "m", unit: "count",
  valueKind: "number", number: "0", periodStart: "2026-09-01", periodEnd: "2026-09-30",
};

describe("formulários de curadoria manual", () => {
  it("zero digitado com período é zero observado; ausência não vira número", () => {
    expect(parseObservationForm(form(base), "A", "o1", "e1").value).toEqual({ kind: "number", value: 0 });
    const absent = parseObservationForm(form({ ...base, valueKind: "unavailable", number: "", periodStart: "", periodEnd: "" }), "A", "o1", "e2");
    expect(absent.value).toEqual({ kind: "absent", state: "unavailable" });
  });
  it("número em branco não é aceito como zero", () => {
    expect(() => parseObservationForm(form({ ...base, number: "" }), "A", "o1", "e1")).toThrow(ValidationError);
  });
  it("marca coleta como manual e usa a loja do servidor, ignorando storeId do formulário", () => {
    const o = parseObservationForm(form({ ...base, storeId: "B" }), "A", "o1", "e1");
    expect(o.method).toBe("manual");
    expect(o.storeId).toBe("A");
  });
  it("rejeita dimensão desconhecida e oportunidade sem campos obrigatórios", () => {
    expect(() => parseObservationForm(form({ ...base, dimension: "sales" }), "A", "o1", "e1")).toThrow(ValidationError);
    expect(() => parseOpportunityForm(form({ product: "x" }), "A", "o1")).toThrow(ValidationError);
  });
});
