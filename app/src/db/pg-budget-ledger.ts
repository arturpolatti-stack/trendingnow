import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import {
  BudgetDeniedError, monthStartUtc, type BudgetLedger, type BudgetLimits, type Reservation,
} from "@/domain/ai-budget";
import type { StoreId } from "@/domain/types";

type AnyDb = PgDatabase<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const SPENT = sql`CASE WHEN status = 'open' THEN reserved_micros WHEN status = 'settled' THEN actual_micros ELSE 0 END`;
const num = (v: unknown) => Number(v ?? 0);

/**
 * Livro-razão em Postgres. Reservar é uma transação que toma uma trava consultiva
 * global: checagem e inserção ficam atômicas mesmo com várias instâncias do servidor
 * (disputas simultâneas não ultrapassam o limite).
 */
export class PgBudgetLedger implements BudgetLedger {
  constructor(private db: AnyDb, private limits: BudgetLimits, private now: () => Date = () => new Date()) {}

  async reserve(storeId: StoreId, input: string, cost: number, requestKey: string): Promise<Reservation> {
    if (input.length > this.limits.maxInputChars) throw new BudgetDeniedError("size");
    const now = this.now();
    const month = monthStartUtc(now).toISOString();
    const staleBefore = new Date(now.getTime() - this.limits.openTtlMs).toISOString();
    const id = randomUUID();

    await this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('trendingnow_ai_budget'))`);
      const attempts = await tx.execute(sql`SELECT count(*) AS n FROM ai_reservations WHERE request_key = ${requestKey}`);
      if (num(attempts.rows[0]?.n) >= this.limits.maxAttemptsPerRequest) throw new BudgetDeniedError("attempts");

      const running = await tx.execute(sql`
        SELECT count(*) AS n FROM ai_reservations
        WHERE store_id = ${storeId} AND status = 'open' AND created_at > ${staleBefore}::timestamptz`);
      if (num(running.rows[0]?.n) >= this.limits.maxConcurrentPerStore) throw new BudgetDeniedError("concurrency");

      const spent = await tx.execute(sql`
        SELECT coalesce(sum(CASE WHEN store_id = ${storeId} THEN ${SPENT} ELSE 0 END), 0) AS store,
               coalesce(sum(${SPENT}), 0) AS global
        FROM ai_reservations WHERE created_at >= ${month}::timestamptz`);
      if (num(spent.rows[0]?.store) + cost > this.limits.perStoreMicros) throw new BudgetDeniedError("store");
      if (num(spent.rows[0]?.global) + cost > this.limits.globalMicros) throw new BudgetDeniedError("global");

      await tx.execute(sql`
        INSERT INTO ai_reservations (id, store_id, request_key, reserved_micros, status, created_at)
        VALUES (${id}, ${storeId}, ${requestKey}, ${cost}, 'open', ${now.toISOString()}::timestamptz)`);
    });
    return { id, storeId, reservedMicros: cost, requestKey };
  }

  async settle(storeId: StoreId, id: string, actual: number) {
    const res = await this.db.execute(sql`
      UPDATE ai_reservations SET status = 'settled', actual_micros = ${actual}, settled_at = now()
      WHERE id = ${id} AND store_id = ${storeId} AND status = 'open'
      RETURNING reserved_micros`);
    if (res.rows.length === 0) throw new Error("Reserva inexistente ou já encerrada");
    return { overrunMicros: Math.max(0, actual - num(res.rows[0].reserved_micros)) };
  }

  async release(storeId: StoreId, id: string) {
    const res = await this.db.execute(sql`
      UPDATE ai_reservations SET status = 'released', settled_at = now()
      WHERE id = ${id} AND store_id = ${storeId} AND status = 'open' RETURNING id`);
    if (res.rows.length === 0) throw new Error("Reserva inexistente ou já encerrada");
  }

  async usage(storeId: StoreId) {
    const month = monthStartUtc(this.now()).toISOString();
    const res = await this.db.execute(sql`
      SELECT coalesce(sum(CASE WHEN store_id = ${storeId} THEN ${SPENT} ELSE 0 END), 0) AS store,
             coalesce(sum(${SPENT}), 0) AS global
      FROM ai_reservations WHERE created_at >= ${month}::timestamptz`);
    return { storeMicros: num(res.rows[0]?.store), globalMicros: num(res.rows[0]?.global) };
  }
}
