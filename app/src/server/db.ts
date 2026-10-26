import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createPgRepositories, type Repositories } from "@/db/repositories";

/** Pool reutilizado entre recarregamentos em desenvolvimento. Pequeno: o Neon usa pooler externo. */
const g = globalThis as unknown as { __trendingnowDb?: Repositories };

function create(): Repositories {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  // pg trata sslmode=require como verify-full; explicitar evita o aviso e mantém o comportamento.
  const connectionString = url.replace("sslmode=require", "sslmode=verify-full");
  const pool = new Pool({ connectionString, max: 5 });
  return createPgRepositories(drizzle(pool));
}

export const db: Repositories = new Proxy({} as Repositories, {
  get: (_, key: keyof Repositories) => (g.__trendingnowDb ??= create())[key],
});
