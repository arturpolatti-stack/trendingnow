import type { StoreId } from "./types";

/**
 * Contexto de acesso criado no servidor a partir da sessão autenticada.
 * Nunca construído a partir de parâmetros da requisição (INV-01).
 */
export interface StoreContext {
  readonly storeId: StoreId;
}

export class NotFoundError extends Error {}

export interface Owned {
  id: string;
  storeId: StoreId;
}

/**
 * Contrato de repositório isolado por loja. Registros de outra loja são
 * indistinguíveis de registros inexistentes (sem vazar existência).
 * As implementações (memória e Postgres) passam pela mesma suíte de contrato.
 */
export interface Repository<T extends Owned> {
  create(ctx: StoreContext, item: T): Promise<T>;
  get(ctx: StoreContext, id: string): Promise<T>;
  list(ctx: StoreContext): Promise<T[]>;
  update(ctx: StoreContext, id: string, patch: Partial<Omit<T, "id" | "storeId">>): Promise<T>;
  delete(ctx: StoreContext, id: string): Promise<void>;
}

export const NOT_FOUND = "Registro não encontrado";

export class InMemoryRepository<T extends Owned> implements Repository<T> {
  private items = new Map<string, T>();

  async create(ctx: StoreContext, item: T): Promise<T> {
    if (item.storeId !== ctx.storeId) throw new NotFoundError(NOT_FOUND);
    if (this.items.has(item.id)) throw new NotFoundError(NOT_FOUND);
    this.items.set(item.id, structuredClone(item));
    return structuredClone(item);
  }

  async get(ctx: StoreContext, id: string): Promise<T> {
    const item = this.items.get(id);
    if (!item || item.storeId !== ctx.storeId) throw new NotFoundError(NOT_FOUND);
    return structuredClone(item);
  }

  async list(ctx: StoreContext): Promise<T[]> {
    return [...this.items.values()].filter((i) => i.storeId === ctx.storeId).map((i) => structuredClone(i));
  }

  async update(ctx: StoreContext, id: string, patch: Partial<Omit<T, "id" | "storeId">>): Promise<T> {
    const current = await this.get(ctx, id);
    const next = { ...current, ...patch, id: current.id, storeId: current.storeId } as T;
    this.items.set(id, structuredClone(next));
    return structuredClone(next);
  }

  async delete(ctx: StoreContext, id: string): Promise<void> {
    await this.get(ctx, id);
    this.items.delete(id);
  }
}
