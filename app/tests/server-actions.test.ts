import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Repositories } from "@/db/repositories";
import { createPgRepositories } from "@/db/repositories";
import { BRIEFING_FIELDS } from "@/domain/types";

// Estado controlado pelos testes: quem está logado (ou ninguém).
const h = vi.hoisted(() => ({ current: null as string | null, repos: null as unknown }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw new Error(`NEXT_REDIRECT:${url}`); },
}));
vi.mock("@/server/session", () => ({
  getStoreContext: async () => {
    if (!h.current) throw new Error("NEXT_REDIRECT:/login"); // sem sessão, como o redirect real
    return { storeId: h.current };
  },
}));
vi.mock("@/server/db", () => ({
  db: new Proxy({}, { get: (_, k) => (h.repos as Record<string, unknown>)[k as string] }),
}));

import * as actions from "@/server/actions";

const form = (o: Record<string, string | string[]>) =>
  ({
    get: (n: string) => { const v = o[n]; return Array.isArray(v) ? (v[0] ?? null) : (v ?? null); },
    getAll: (n: string) => { const v = o[n]; return v === undefined ? [] : Array.isArray(v) ? v : [v]; },
  }) as unknown as FormData;

const oppForm = form({ product: "bundle", audience: "a", occasion: "o" });
const obsForm = form({
  dimension: "demand", source: "Etsy", sourceUrl: "https://x.test", term: "t", metric: "m", unit: "count",
  valueKind: "number", number: "5", periodStart: "2026-09-01", periodEnd: "2026-09-30",
});

let repos: Repositories;
let reset: () => Promise<void>;
beforeAll(async () => {
  const pg = drizzle(new PGlite());
  await migrate(pg, { migrationsFolder: "./drizzle" });
  repos = createPgRepositories(pg);
  h.repos = repos;
  reset = async () => { await pg.execute(sql`TRUNCATE opportunities, observations, decisions, briefings, store_profiles`); };
}, 60_000);

/** A cria uma oportunidade pela action real e devolve o id. */
async function createAsA(): Promise<string> {
  h.current = "A";
  await expect(actions.createOpportunity({}, oppForm)).rejects.toThrow(/NEXT_REDIRECT:\/opportunities\//);
  const [o] = await repos.opportunities.list({ storeId: "A" });
  return o.id;
}

describe("INV-01 nas server actions (duas lojas, Postgres)", () => {
  beforeEach(async () => { h.current = null; await reset(); });

  it("sem sessão nenhuma action grava algo", async () => {
    await expect(actions.createOpportunity({}, oppForm)).rejects.toThrow(/NEXT_REDIRECT:\/login/);
    await expect(actions.saveProfile({}, form({ name: "x" }))).rejects.toThrow(/NEXT_REDIRECT:\/login/);
    expect(await repos.opportunities.list({ storeId: "A" })).toEqual([]);
  });

  it("a cria; B não consegue acrescentar observação, decisão ou briefing à oportunidade de A", async () => {
    const id = await createAsA();
    h.current = "B";
    expect((await actions.addObservation(id, {}, obsForm)).error).toBeTruthy();
    expect((await actions.saveDecision(id, {}, form({ kind: "choose", reason: "r" }))).error).toBeTruthy();
    const full = Object.fromEntries(BRIEFING_FIELDS.map((k) => [k, "x"]));
    expect((await actions.saveBriefing(id, {}, form({ ...full, reason1: "a", reason2: "b", uncertainty: "u" }))).error).toBeTruthy();
    for (const store of ["A", "B"]) {
      expect(await repos.observations.list({ storeId: store })).toEqual([]);
      expect(await repos.decisions.list({ storeId: store })).toEqual([]);
      expect(await repos.briefings.list({ storeId: store })).toEqual([]);
    }
  });

  it("B não avança etapa nem altera a decisão de A", async () => {
    const id = await createAsA();
    await actions.saveDecision(id, {}, form({ kind: "choose", reason: "r" }));
    h.current = "B";
    await expect(actions.advanceStage(id, form({ stage: "created" }))).rejects.toThrow();
    expect((await repos.decisions.get({ storeId: "A" }, `d-${id}`)).stage).toBe("chosen");
  });

  it("briefing de B não pode citar observação de A", async () => {
    const idA = await createAsA();
    await actions.addObservation(idA, {}, obsForm);
    const [obsA] = await repos.observations.list({ storeId: "A" });
    h.current = "B";
    await expect(actions.createOpportunity({}, oppForm)).rejects.toThrow(/NEXT_REDIRECT/);
    const [oppB] = await repos.opportunities.list({ storeId: "B" });
    const full = Object.fromEntries(BRIEFING_FIELDS.map((k) => [k, "x"]));
    const res = await actions.saveBriefing(oppB.id, {}, form({
      ...full, reason1: "a", reason1Ev: [obsA.id], reason2: "b", reason2Ev: [obsA.id], uncertainty: "u", uncertaintyEv: [obsA.id],
    }));
    expect(res.error).toMatch(/inexistente/);
    expect(await repos.briefings.list({ storeId: "B" })).toEqual([]);
  });

  it("a ignora storeId enviado no formulário: a loja vem sempre da sessão", async () => {
    h.current = "A";
    await expect(actions.createOpportunity({}, form({ product: "p", audience: "a", occasion: "o", storeId: "B" }))).rejects.toThrow(/NEXT_REDIRECT/);
    expect(await repos.opportunities.list({ storeId: "B" })).toEqual([]);
    expect((await repos.opportunities.list({ storeId: "A" })).length).toBe(1);
  });

  it("erro de validação volta ao formulário sem gravar", async () => {
    const id = await createAsA();
    const res = await actions.addObservation(id, {}, form({ dimension: "demand", valueKind: "number", number: "1" }));
    expect(res.error).toBeTruthy();
    expect(await repos.observations.list({ storeId: "A" })).toEqual([]);
  });

  it("fluxo feliz de A: observação, decisão e etapa avançam", async () => {
    const id = await createAsA();
    expect((await actions.addObservation(id, {}, obsForm)).ok).toBe(true);
    expect((await actions.saveDecision(id, {}, form({ kind: "choose", reason: "r" }))).ok).toBe(true);
    await actions.advanceStage(id, form({ stage: "created" }));
    expect((await repos.decisions.get({ storeId: "A" }, `d-${id}`)).stage).toBe("created");
  });
});
