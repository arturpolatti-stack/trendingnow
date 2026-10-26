import type { StoreId } from "./types";

/** Valores monetários em microdólares (inteiros) para evitar erro de ponto flutuante. */
export interface BudgetLimits {
  /** Teto mensal global e por loja (mês civil UTC). */
  globalMicros: number;
  perStoreMicros: number;
  maxInputChars: number;
  maxConcurrentPerStore: number;
  /** Tentativas por chave de requisição, incluindo as devolvidas. */
  maxAttemptsPerRequest: number;
  /** Reserva aberta há mais tempo que isso deixa de contar como chamada em andamento, mas continua contando como gasto. */
  openTtlMs: number;
}

export interface Reservation {
  id: string;
  storeId: StoreId;
  reservedMicros: number;
  requestKey: string;
}

export class BudgetDeniedError extends Error {
  constructor(readonly reason: "global" | "store" | "size" | "concurrency" | "attempts") {
    super(`Consumo de IA negado: ${reason}`);
  }
}

/**
 * Autoriza o consumo antes da chamada (INV-04) e reconcilia depois.
 * Gasto = reservas abertas (valor reservado, conservador) + liquidadas (custo real).
 * Reservas devolvidas não contam. Settle/release exigem a loja dona da reserva (INV-01).
 */
export interface BudgetLedger {
  reserve(storeId: StoreId, input: string, conservativeCostMicros: number, requestKey: string): Promise<Reservation>;
  /** Registra o custo real. Custo acima da reserva é registrado e informado, não escondido. */
  settle(storeId: StoreId, reservationId: string, actualMicros: number): Promise<{ overrunMicros: number }>;
  /** Chamada não realizada: devolve a reserva. */
  release(storeId: StoreId, reservationId: string): Promise<void>;
  usage(storeId: StoreId): Promise<{ storeMicros: number; globalMicros: number }>;
}

export const monthStartUtc = (now: Date): Date => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

type Status = "open" | "settled" | "released";
interface Row extends Reservation { status: Status; actualMicros?: number; createdAt: Date }

const spentOf = (r: Row) => (r.status === "open" ? r.reservedMicros : r.status === "settled" ? r.actualMicros! : 0);

export class InMemoryBudgetLedger implements BudgetLedger {
  private rows: Row[] = [];
  private seq = 0;

  constructor(private limits: BudgetLimits, private now: () => Date = () => new Date()) {}

  async reserve(storeId: StoreId, input: string, cost: number, requestKey: string): Promise<Reservation> {
    const now = this.now();
    const month = monthStartUtc(now);
    if (input.length > this.limits.maxInputChars) throw new BudgetDeniedError("size");
    if (this.rows.filter((r) => r.requestKey === requestKey).length >= this.limits.maxAttemptsPerRequest) {
      throw new BudgetDeniedError("attempts");
    }
    const running = this.rows.filter(
      (r) => r.storeId === storeId && r.status === "open" && now.getTime() - r.createdAt.getTime() < this.limits.openTtlMs,
    ).length;
    if (running >= this.limits.maxConcurrentPerStore) throw new BudgetDeniedError("concurrency");
    const inMonth = this.rows.filter((r) => r.createdAt >= month);
    const store = inMonth.filter((r) => r.storeId === storeId).reduce((s, r) => s + spentOf(r), 0);
    if (store + cost > this.limits.perStoreMicros) throw new BudgetDeniedError("store");
    if (inMonth.reduce((s, r) => s + spentOf(r), 0) + cost > this.limits.globalMicros) throw new BudgetDeniedError("global");
    const row: Row = { id: `r${++this.seq}`, storeId, reservedMicros: cost, requestKey, status: "open", createdAt: now };
    this.rows.push(row);
    return { id: row.id, storeId, reservedMicros: cost, requestKey };
  }

  private open(storeId: StoreId, id: string): Row {
    const r = this.rows.find((x) => x.id === id && x.storeId === storeId && x.status === "open");
    if (!r) throw new Error("Reserva inexistente ou já encerrada");
    return r;
  }

  async settle(storeId: StoreId, id: string, actualMicros: number) {
    const r = this.open(storeId, id);
    r.status = "settled";
    r.actualMicros = actualMicros;
    return { overrunMicros: Math.max(0, actualMicros - r.reservedMicros) };
  }

  async release(storeId: StoreId, id: string) {
    this.open(storeId, id).status = "released";
  }

  async usage(storeId: StoreId) {
    const month = monthStartUtc(this.now());
    const inMonth = this.rows.filter((r) => r.createdAt >= month);
    return {
      storeMicros: inMonth.filter((r) => r.storeId === storeId).reduce((s, r) => s + spentOf(r), 0),
      globalMicros: inMonth.reduce((s, r) => s + spentOf(r), 0),
    };
  }
}

/**
 * Executa uma chamada de IA sob autorização: reserva antes, devolve se a chamada falhar,
 * liquida com o custo real se der certo.
 */
export async function withAiBudget<T>(
  ledger: BudgetLedger,
  args: { storeId: StoreId; input: string; conservativeCostMicros: number; requestKey: string },
  call: () => Promise<{ result: T; actualCostMicros: number }>,
): Promise<{ result: T; overrunMicros: number }> {
  const r = await ledger.reserve(args.storeId, args.input, args.conservativeCostMicros, args.requestKey);
  let out;
  try {
    out = await call();
  } catch (e) {
    // A chamada pode ter ocorrido no provedor; mas sem custo informado, devolvemos a reserva.
    await ledger.release(args.storeId, r.id);
    throw e;
  }
  const { overrunMicros } = await ledger.settle(args.storeId, r.id, out.actualCostMicros);
  return { result: out.result, overrunMicros };
}
