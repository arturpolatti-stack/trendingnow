import type { StoreId } from "./types";

/**
 * Contexto de acesso criado no servidor a partir da sessão autenticada.
 * Nunca construído a partir de parâmetros da requisição (INV-01).
 */
export interface StoreContext {
  readonly storeId: StoreId;
}

export class NotFoundError extends Error {}

interface Owned {
  id: string;
  storeId: StoreId;
}

/**
 * Repositório em memória isolado por loja. Registros de outra loja são
 * indistinguíveis de registros inexistentes (sem vazar existência).
 */
export class ScopedRepository<T extends Owned> {
  private items = new Map<string, T>();

  create(ctx: StoreContext, item: T): T {
    if (item.storeId !== ctx.storeId) throw new NotFoundError("Registro não encontrado");
    if (this.items.has(item.id)) throw new NotFoundError("Identificador já em uso");
    this.items.set(item.id, structuredClone(item));
    return structuredClone(item);
  }

  get(ctx: StoreContext, id: string): T {
    const item = this.items.get(id);
    if (!item || item.storeId !== ctx.storeId) throw new NotFoundError("Registro não encontrado");
    return structuredClone(item);
  }

  list(ctx: StoreContext): T[] {
    return [...this.items.values()]
      .filter((i) => i.storeId === ctx.storeId)
      .map((i) => structuredClone(i));
  }

  update(ctx: StoreContext, id: string, patch: Partial<Omit<T, "id" | "storeId">>): T {
    const current = this.get(ctx, id);
    const next = { ...current, ...patch, id: current.id, storeId: current.storeId } as T;
    this.items.set(id, structuredClone(next));
    return structuredClone(next);
  }

  delete(ctx: StoreContext, id: string): void {
    this.get(ctx, id);
    this.items.delete(id);
  }
}
