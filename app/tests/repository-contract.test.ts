import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createPgRepositories, type Repositories } from "@/db/repositories";
import { InMemoryRepository, NotFoundError, type Repository } from "@/domain/scoped-repository";
import type { Briefing, Decision, Opportunity } from "@/domain/types";
import { briefing, obs, opp } from "./helpers";

const A = { storeId: "A" };
const B = { storeId: "B" };

/** Mesma suíte de INV-01 para a implementação em memória e para Postgres (PGlite). */
function isolationContract(name: string, make: () => Promise<Repository<Opportunity>> | Repository<Opportunity>, reset?: () => Promise<void>) {
  describe(`INV-01 isolamento entre lojas — ${name}`, () => {
    let repo: Repository<Opportunity>;
    beforeEach(async () => {
      await reset?.();
      repo = await make();
      await repo.create(A, opp("A", "oA"));
      await repo.create(B, opp("B", "oB"));
    });

    it("troca de identificador não lê dados da outra loja", async () => {
      await expect(repo.get(A, "oB")).rejects.toThrow(NotFoundError);
    });
    it("mensagem idêntica para inexistente e para outra loja (sem vazar existência)", async () => {
      const msg = async (id: string) => repo.get(A, id).catch((e: Error) => e.message);
      expect(await msg("oB")).toBe(await msg("nao-existe"));
    });
    it("não altera nem apaga registro de outra loja", async () => {
      await expect(repo.update(A, "oB", { product: "x" })).rejects.toThrow(NotFoundError);
      await expect(repo.delete(A, "oB")).rejects.toThrow(NotFoundError);
      expect((await repo.get(B, "oB")).product).toBe("bundle");
    });
    it("não cria registro em nome de outra loja nem sobrescreve id alheio", async () => {
      await expect(repo.create(A, opp("B", "oX"))).rejects.toThrow(NotFoundError);
      await expect(repo.create(A, opp("A", "oB"))).rejects.toThrow(NotFoundError);
      expect((await repo.get(B, "oB")).storeId).toBe("B");
    });
    it("update não permite reatribuir a loja", async () => {
      await repo.update(A, "oA", { storeId: "B" } as never);
      expect((await repo.get(A, "oA")).storeId).toBe("A");
      await expect(repo.get(B, "oA")).rejects.toThrow(NotFoundError);
    });
    it("listagem retorna só a própria loja", async () => {
      expect((await repo.list(A)).map((o) => o.id)).toEqual(["oA"]);
    });
    it("update e delete funcionam dentro da própria loja", async () => {
      expect((await repo.update(A, "oA", { product: "novo" })).product).toBe("novo");
      await repo.delete(A, "oA");
      await expect(repo.get(A, "oA")).rejects.toThrow(NotFoundError);
    });
  });
}

isolationContract("memória", () => new InMemoryRepository<Opportunity>());

describe("Postgres (PGlite com as migrações reais)", () => {
  let repos: Repositories;
  let reset: () => Promise<void>;

  beforeAll(async () => {
    const db = drizzle(new PGlite());
    await migrate(db, { migrationsFolder: "./drizzle" });
    repos = createPgRepositories(db);
    reset = async () => {
      await db.execute(sql`TRUNCATE opportunities, observations, decisions, briefings, store_profiles`);
    };
  }, 60_000);

  isolationContract("postgres", () => repos.opportunities, async () => reset());

  describe("persistência fiel e isolamento nas demais tabelas", () => {
    beforeEach(async () => reset());

    it("observação preserva valor numérico, ausência e campos opcionais", async () => {
      const num = obs("A", "e1");
      const absent = obs("A", "e2", { value: { kind: "absent", state: "stale" }, periodStart: undefined, periodEnd: undefined });
      await repos.observations.create(A, num);
      await repos.observations.create(A, absent);
      expect(await repos.observations.get(A, "e1")).toEqual(num);
      const back = await repos.observations.get(A, "e2");
      expect(back.value).toEqual({ kind: "absent", state: "stale" });
      expect(back.periodStart).toBeUndefined();
      expect(back.normalization).toBeUndefined();
    });
    it("zero observado volta como número, não como ausência", async () => {
      await repos.observations.create(A, obs("A", "e0", { value: { kind: "number", value: 0 } }));
      expect((await repos.observations.get(A, "e0")).value).toEqual({ kind: "number", value: 0 });
    });
    it("decisão sem etapa e com etapa volta igual", async () => {
      const d: Decision = { id: "d1", storeId: "A", opportunityId: "o1", kind: "reject", reason: "r", decidedAt: "2026-10-26T10:00:00.000Z" };
      await repos.decisions.create(A, d);
      expect(await repos.decisions.get(A, "d1")).toEqual(d);
      const updated = await repos.decisions.update(A, "d1", { kind: "choose", stage: "chosen" });
      expect(updated.stage).toBe("chosen");
    });
    it("briefing e perfil fazem ida e volta", async () => {
      const b: Briefing = briefing("A", ["e1"]);
      await repos.briefings.create(A, b);
      expect(await repos.briefings.get(A, "b1")).toEqual(b);
      const p = { id: "A", storeId: "A", name: "Loja", market: "US", categories: "", capacity: "", maxEffortHours: null };
      await repos.profiles.create(A, p);
      expect(await repos.profiles.get(A, "A")).toEqual(p);
    });
    it("nenhuma tabela vaza dados para outra loja", async () => {
      await repos.observations.create(A, obs("A", "e1"));
      await repos.briefings.create(A, briefing("A", ["e1"]));
      await repos.profiles.create(A, { id: "A", storeId: "A", name: "n", market: "US", categories: "", capacity: "", maxEffortHours: 3 });
      await repos.decisions.create(A, { id: "d1", storeId: "A", opportunityId: "o1", kind: "reject", reason: "r", decidedAt: "2026-10-26T10:00:00.000Z" });
      await expect(repos.observations.get(B, "e1")).rejects.toThrow(NotFoundError);
      await expect(repos.briefings.get(B, "b1")).rejects.toThrow(NotFoundError);
      await expect(repos.profiles.get(B, "A")).rejects.toThrow(NotFoundError);
      await expect(repos.decisions.get(B, "d1")).rejects.toThrow(NotFoundError);
      for (const r of [repos.observations, repos.briefings, repos.profiles, repos.decisions] as Repository<never>[]) {
        expect(await r.list(B)).toEqual([]);
      }
    });
  });
});

