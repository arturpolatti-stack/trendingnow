import { describe, expect, it } from "vitest";
import { NotFoundError, ScopedRepository } from "@/domain/scoped-repository";
import type { Opportunity } from "@/domain/types";
import { opp } from "./helpers";

const A = { storeId: "A" };
const B = { storeId: "B" };

describe("INV-01 isolamento entre lojas", () => {
  const setup = () => {
    const repo = new ScopedRepository<Opportunity>();
    repo.create(A, opp("A", "oA"));
    repo.create(B, opp("B", "oB"));
    return repo;
  };

  it("troca de identificador não lê dados da outra loja", () => {
    expect(() => setup().get(A, "oB")).toThrow(NotFoundError);
  });
  it("mensagem é idêntica para inexistente e para outra loja (sem vazar existência)", () => {
    const repo = setup();
    const msg = (id: string) => { try { repo.get(A, id); } catch (e) { return (e as Error).message; } };
    expect(msg("oB")).toBe(msg("nao-existe"));
  });
  it("não altera nem apaga registro de outra loja", () => {
    const repo = setup();
    expect(() => repo.update(A, "oB", { product: "x" })).toThrow(NotFoundError);
    expect(() => repo.delete(A, "oB")).toThrow(NotFoundError);
    expect(repo.get(B, "oB").product).toBe("bundle");
  });
  it("não cria registro em nome de outra loja nem sobrescreve id alheio", () => {
    const repo = setup();
    expect(() => repo.create(A, opp("B", "oX"))).toThrow(NotFoundError);
    expect(() => repo.create(A, opp("A", "oB"))).toThrow(NotFoundError);
  });
  it("update não permite reatribuir a loja", () => {
    const repo = setup();
    repo.update(A, "oA", { storeId: "B" } as never);
    expect(repo.get(A, "oA").storeId).toBe("A");
  });
  it("listagem retorna só a própria loja e cópias imutáveis", () => {
    const repo = setup();
    const list = repo.list(A);
    expect(list.map((o) => o.id)).toEqual(["oA"]);
    list[0].product = "mutado";
    expect(repo.get(A, "oA").product).toBe("bundle");
  });
});
