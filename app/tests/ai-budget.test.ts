import { describe, expect, it } from "vitest";
import { AiBudget, BudgetDeniedError } from "@/domain/ai-budget";

const limits = { globalMicros: 1000, perStoreMicros: 600, maxInputChars: 100, maxConcurrentPerStore: 2, maxAttemptsPerRequest: 2 };
const denied = (fn: () => unknown) => { try { fn(); } catch (e) { return (e as BudgetDeniedError).reason; } };

describe("INV-04 autorização de consumo de IA", () => {
  it("nega antes da chamada quando excede limite da loja", () => {
    const b = new AiBudget(limits);
    b.reserve("A", "x", 400, "k1");
    expect(denied(() => b.reserve("A", "x", 300, "k2"))).toBe("store");
  });
  it("nega quando excede limite global", () => {
    const b = new AiBudget({ ...limits, perStoreMicros: 900 });
    b.reserve("A", "x", 600, "k1");
    b.reserve("B", "x", 300, "k2");
    expect(denied(() => b.reserve("C", "x", 200, "k3"))).toBe("global");
  });
  it("disputa simultânea não ultrapassa o limite", async () => {
    const b = new AiBudget({ ...limits, maxConcurrentPerStore: 50 });
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) => Promise.resolve().then(() => b.reserve("A", "x", 100, `k${i}`))),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(6);
    expect(b.usage("A").storeMicros).toBeLessThanOrEqual(limits.perStoreMicros);
  });
  it("limita tamanho, concorrência e tentativas", () => {
    const b = new AiBudget(limits);
    expect(denied(() => b.reserve("A", "x".repeat(101), 1, "k"))).toBe("size");
    b.reserve("A", "x", 1, "c1");
    b.reserve("A", "x", 1, "c2");
    expect(denied(() => b.reserve("A", "x", 1, "c3"))).toBe("concurrency");
    const b2 = new AiBudget(limits);
    for (let i = 0; i < 2; i++) b2.release(b2.reserve("A", "x", 1, "same").id);
    expect(denied(() => b2.reserve("A", "x", 1, "same"))).toBe("attempts");
  });
  it("reconcilia custo real, devolve reserva e registra estouro", () => {
    const b = new AiBudget(limits);
    const r1 = b.reserve("A", "x", 300, "k1");
    expect(b.settle(r1.id, 120).overrunMicros).toBe(0);
    expect(b.usage("A").storeMicros).toBe(120);
    const r2 = b.reserve("A", "x", 100, "k2");
    expect(b.settle(r2.id, 160).overrunMicros).toBe(60);
    const r3 = b.reserve("A", "x", 50, "k3");
    b.release(r3.id);
    expect(b.usage("A").storeMicros).toBe(280);
    expect(() => b.release(r3.id)).toThrow();
  });
});
