import { and, eq, type SQL } from "drizzle-orm";
import type { AnyPgColumn, PgDatabase, PgTable } from "drizzle-orm/pg-core";
import { NOT_FOUND, NotFoundError, type Owned, type Repository, type StoreContext } from "@/domain/scoped-repository";

type AnyDb = PgDatabase<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Row = Record<string, unknown>;
type TableWithOwner = PgTable & { id: AnyPgColumn; storeId: AnyPgColumn };

/**
 * Repositório Postgres isolado por loja. Toda consulta inclui store_id vindo do
 * contexto do servidor; registros de outra loja respondem como inexistentes (INV-01).
 */
export class PgRepository<T extends Owned> implements Repository<T> {
  constructor(
    private db: AnyDb,
    private table: TableWithOwner,
    private toRow: (item: T) => Row,
    private fromRow: (row: Row) => T,
  ) {}

  private owned(ctx: StoreContext, id: string): SQL {
    return and(eq(this.table.id, id), eq(this.table.storeId, ctx.storeId)) as SQL;
  }

  async create(ctx: StoreContext, item: T): Promise<T> {
    if (item.storeId !== ctx.storeId) throw new NotFoundError(NOT_FOUND);
    const inserted = await this.db.insert(this.table).values(this.toRow(item) as never).onConflictDoNothing().returning();
    if (inserted.length === 0) throw new NotFoundError(NOT_FOUND); // id já em uso (mesma resposta de "inexistente")
    return this.fromRow(inserted[0] as Row);
  }

  async get(ctx: StoreContext, id: string): Promise<T> {
    const rows = await this.db.select().from(this.table).where(this.owned(ctx, id)).limit(1);
    if (rows.length === 0) throw new NotFoundError(NOT_FOUND);
    return this.fromRow(rows[0] as Row);
  }

  async list(ctx: StoreContext): Promise<T[]> {
    const rows = await this.db.select().from(this.table).where(eq(this.table.storeId, ctx.storeId));
    return rows.map((r) => this.fromRow(r as Row));
  }

  async update(ctx: StoreContext, id: string, patch: Partial<Omit<T, "id" | "storeId">>): Promise<T> {
    const current = await this.get(ctx, id);
    const next = { ...current, ...patch, id: current.id, storeId: current.storeId } as T;
    const rows = await this.db.update(this.table).set(this.toRow(next) as never).where(this.owned(ctx, id)).returning();
    if (rows.length === 0) throw new NotFoundError(NOT_FOUND);
    return this.fromRow(rows[0] as Row);
  }

  async delete(ctx: StoreContext, id: string): Promise<void> {
    const rows = await this.db.delete(this.table).where(this.owned(ctx, id)).returning({ id: this.table.id });
    if (rows.length === 0) throw new NotFoundError(NOT_FOUND);
  }
}
