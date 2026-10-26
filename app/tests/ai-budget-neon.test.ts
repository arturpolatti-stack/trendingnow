import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { afterAll, describe, expect, it } from "vitest";
import { PgBudgetLedger } from "@/db/pg-budget-ledger";

config({ path: ".env.local", quiet: true });

/**
 * Concorrência real: várias conexões independentes disputando o mesmo teto.
 * Opt-in (RUN_DB_TESTS=1) porque escreve no banco configurado; usa lojas de teste
 * exclusivas e remove o que criou.
 */
const url = process.env.DATABASE_URL_UNPOOLED?.replace("sslmode=require", "sslmode=verify-full");
describe.skipIf(!process.env.RUN_DB_TESTS || !url)("INV-04 com conexões concorrentes (Postgres real)", () => {
  const prefix = `test-neon-${Date.now()}`;
  const pools = Array.from({ length: 6 }, () => new Pool({ connectionString: url, max: 1 }));
  const ledgers = pools.map((p) => new PgBudgetLedger(drizzle(p), {
    globalMicros: 1e12, perStoreMicros: 1000, maxInputChars: 10, maxConcurrentPerStore: 100, maxAttemptsPerRequest: 100, openTtlMs: 60_000,
  }));

  afterAll(async () => {
    await drizzle(pools[0]).execute(sql`DELETE FROM ai_reservations WHERE store_id LIKE ${prefix + "%"}`);
    await Promise.all(pools.map((p) => p.end()));
  });

  it("20 reservas simultâneas de 100 em 6 conexões: no máximo 10 passam", async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, (_, i) => ledgers[i % ledgers.length].reserve(`${prefix}-A`, "x", 100, `${prefix}-k${i}`)),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(10);
    expect((await ledgers[0].usage(`${prefix}-A`)).storeMicros).toBe(1000);
  }, 60_000);
});
