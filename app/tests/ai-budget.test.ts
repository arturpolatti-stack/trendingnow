import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PgBudgetLedger } from "@/db/pg-budget-ledger";
import {
  BudgetDeniedError, InMemoryBudgetLedger, withAiBudget, type BudgetLedger, type BudgetLimits,
} from "@/domain/ai-budget";

const limits: BudgetLimits = {
  globalMicros: 1000, perStoreMicros: 600, maxInputChars: 100, maxConcurrentPerStore: 2,
  maxAttemptsPerRequest: 2, openTtlMs: 10 * 60_000,
};
const denied = async (p: Promise<unknown>) => p.then(() => undefined, (e: BudgetDeniedError) => e.reason);

/** Mesma suíte de INV-04 para memória e Postgres. `clock` permite avançar o tempo. */
function ledgerContract(name: string, make: (l: BudgetLimits, now: () => Date) => BudgetLedger, reset?: () => Promise<void>) {
  describe(`INV-04 autorização de consumo de IA — ${name}`, () => {
    let t = new Date("2026-10-15T12:00:00Z");
    const now = () => t;
    beforeEach(async () => { t = new Date("2026-10-15T12:00:00Z"); await reset?.(); });

    it("nega antes da chamada quando excede o limite da loja", async () => {
      const b = make(limits, now);
      await b.reserve("A", "x", 400, "k1");
      expect(await denied(b.reserve("A", "x", 300, "k2"))).toBe("store");
    });
    it("nega quando excede o limite global", async () => {
      const b = make({ ...limits, perStoreMicros: 900 }, now);
      await b.reserve("A", "x", 600, "k1");
      await b.reserve("B", "x", 300, "k2");
      expect(await denied(b.reserve("C", "x", 200, "k3"))).toBe("global");
    });
    it("disputa simultânea não ultrapassa o limite", async () => {
      const b = make({ ...limits, maxConcurrentPerStore: 50 }, now);
      const results = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => b.reserve("A", "x", 100, `k${i}`)));
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(6);
      expect((await b.usage("A")).storeMicros).toBeLessThanOrEqual(limits.perStoreMicros);
    });
    it("limita tamanho, concorrência e tentativas", async () => {
      const b = make(limits, now);
      expect(await denied(b.reserve("A", "x".repeat(101), 1, "k"))).toBe("size");
      await b.reserve("A", "x", 1, "c1");
      await b.reserve("A", "x", 1, "c2");
      expect(await denied(b.reserve("A", "x", 1, "c3"))).toBe("concurrency");
      await reset?.(); // memória: instância nova; Postgres: tabela limpa
      const b2 = make(limits, now);
      for (let i = 0; i < 2; i++) await b2.release("A", (await b2.reserve("A", "x", 1, "same")).id);
      expect(await denied(b2.reserve("A", "x", 1, "same"))).toBe("attempts");
    });
    it("reconcilia custo real, devolve reserva e registra estouro", async () => {
      const b = make(limits, now);
      const r1 = await b.reserve("A", "x", 300, "k1");
      expect((await b.settle("A", r1.id, 120)).overrunMicros).toBe(0);
      expect((await b.usage("A")).storeMicros).toBe(120);
      const r2 = await b.reserve("A", "x", 100, "k2");
      expect((await b.settle("A", r2.id, 160)).overrunMicros).toBe(60);
      const r3 = await b.reserve("A", "x", 50, "k3");
      await b.release("A", r3.id);
      expect((await b.usage("A")).storeMicros).toBe(280);
      await expect(b.release("A", r3.id)).rejects.toThrow();
      await expect(b.settle("A", r1.id, 1)).rejects.toThrow(); // já liquidada
    });
    it("outra loja não consegue liquidar nem devolver a reserva", async () => {
      const b = make(limits, now);
      const r = await b.reserve("A", "x", 100, "k1");
      await expect(b.settle("B", r.id, 1)).rejects.toThrow();
      await expect(b.release("B", r.id)).rejects.toThrow();
      expect((await b.usage("A")).storeMicros).toBe(100);
      expect((await b.usage("B")).storeMicros).toBe(0);
    });
    it("o teto é mensal: no mês seguinte o gasto zera", async () => {
      const b = make(limits, now);
      await b.reserve("A", "x", 600, "k1");
      expect(await denied(b.reserve("A", "x", 1, "k2"))).toBe("store");
      t = new Date("2026-11-01T00:00:01Z");
      await expect(b.reserve("A", "x", 600, "k3")).resolves.toBeTruthy();
    });
    it("reserva esquecida deixa de ocupar concorrência, mas continua contando como gasto", async () => {
      const b = make(limits, now);
      await b.reserve("A", "x", 10, "c1");
      await b.reserve("A", "x", 10, "c2");
      expect(await denied(b.reserve("A", "x", 10, "c3"))).toBe("concurrency");
      t = new Date(t.getTime() + limits.openTtlMs + 1);
      await expect(b.reserve("A", "x", 10, "c3")).resolves.toBeTruthy();
      expect((await b.usage("A")).storeMicros).toBe(30);
    });

    describe("withAiBudget", () => {
      it("sucesso: liquida com o custo real", async () => {
        const b = make(limits, now);
        const out = await withAiBudget(b, { storeId: "A", input: "x", conservativeCostMicros: 200, requestKey: "w1" },
          async () => ({ result: "ok", actualCostMicros: 150 }));
        expect(out).toEqual({ result: "ok", overrunMicros: 0 });
        expect((await b.usage("A")).storeMicros).toBe(150);
      });
      it("falha da chamada: devolve a reserva e propaga o erro", async () => {
        const b = make(limits, now);
        await expect(withAiBudget(b, { storeId: "A", input: "x", conservativeCostMicros: 200, requestKey: "w2" },
          async () => { throw new Error("provedor fora"); })).rejects.toThrow("provedor fora");
        expect((await b.usage("A")).storeMicros).toBe(0);
      });
      it("negado: a chamada nem é executada", async () => {
        const b = make(limits, now);
        let called = false;
        await expect(withAiBudget(b, { storeId: "A", input: "x", conservativeCostMicros: 700, requestKey: "w3" },
          async () => { called = true; return { result: 1, actualCostMicros: 1 }; })).rejects.toBeInstanceOf(BudgetDeniedError);
        expect(called).toBe(false);
      });
    });
  });
}

ledgerContract("memória", (l, now) => new InMemoryBudgetLedger(l, now));

describe("Postgres (PGlite com as migrações reais)", () => {
  let pg: ReturnType<typeof drizzle>;
  beforeAll(async () => {
    pg = drizzle(new PGlite());
    await migrate(pg, { migrationsFolder: "./drizzle" });
  }, 60_000);
  // O contrato roda dentro do describe para usar o banco já migrado.
  ledgerContract("postgres", (l, now) => new PgBudgetLedger(pg, l, now), async () => { await pg.execute(sql`TRUNCATE ai_reservations`); });
});
