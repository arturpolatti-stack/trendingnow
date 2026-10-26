import type { StoreId } from "./types";

/** Valores monetários em microdólares (inteiros) para evitar erro de ponto flutuante. */
export interface BudgetLimits {
  globalMicros: number;
  perStoreMicros: number;
  maxInputChars: number;
  maxConcurrentPerStore: number;
  maxAttemptsPerRequest: number;
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
 * Autoriza o consumo antes da chamada (INV-04). A checagem e a reserva são
 * síncronas, portanto atômicas no processo; num banco real exigem transação
 * ou operação condicional equivalente.
 */
export class AiBudget {
  private spent = new Map<StoreId, number>(); // custo liquidado + reservas abertas
  private globalSpent = 0;
  private open = new Map<string, Reservation>();
  private concurrent = new Map<StoreId, number>();
  private attempts = new Map<string, number>();
  private seq = 0;

  constructor(private limits: BudgetLimits) {}

  reserve(storeId: StoreId, input: string, conservativeCostMicros: number, requestKey: string): Reservation {
    if (input.length > this.limits.maxInputChars) throw new BudgetDeniedError("size");
    const tries = (this.attempts.get(requestKey) ?? 0) + 1;
    if (tries > this.limits.maxAttemptsPerRequest) throw new BudgetDeniedError("attempts");
    if ((this.concurrent.get(storeId) ?? 0) >= this.limits.maxConcurrentPerStore) {
      throw new BudgetDeniedError("concurrency");
    }
    if ((this.spent.get(storeId) ?? 0) + conservativeCostMicros > this.limits.perStoreMicros) {
      throw new BudgetDeniedError("store");
    }
    if (this.globalSpent + conservativeCostMicros > this.limits.globalMicros) {
      throw new BudgetDeniedError("global");
    }
    this.attempts.set(requestKey, tries);
    this.spent.set(storeId, (this.spent.get(storeId) ?? 0) + conservativeCostMicros);
    this.globalSpent += conservativeCostMicros;
    this.concurrent.set(storeId, (this.concurrent.get(storeId) ?? 0) + 1);
    const r: Reservation = { id: `r${++this.seq}`, storeId, reservedMicros: conservativeCostMicros, requestKey };
    this.open.set(r.id, r);
    return r;
  }

  /** Reconcilia com o custo real. Custo real acima da reserva é registrado, não escondido. */
  settle(reservationId: string, actualMicros: number): { overrunMicros: number } {
    const r = this.take(reservationId);
    const delta = actualMicros - r.reservedMicros;
    this.spent.set(r.storeId, (this.spent.get(r.storeId) ?? 0) + delta);
    this.globalSpent += delta;
    return { overrunMicros: Math.max(0, delta) };
  }

  /** Chamada não realizada: devolve a reserva. */
  release(reservationId: string): void {
    const r = this.take(reservationId);
    this.spent.set(r.storeId, (this.spent.get(r.storeId) ?? 0) - r.reservedMicros);
    this.globalSpent -= r.reservedMicros;
  }

  usage(storeId: StoreId): { storeMicros: number; globalMicros: number } {
    return { storeMicros: this.spent.get(storeId) ?? 0, globalMicros: this.globalSpent };
  }

  private take(id: string): Reservation {
    const r = this.open.get(id);
    if (!r) throw new Error("Reserva inexistente ou já encerrada");
    this.open.delete(id);
    this.concurrent.set(r.storeId, (this.concurrent.get(r.storeId) ?? 1) - 1);
    return r;
  }
}
