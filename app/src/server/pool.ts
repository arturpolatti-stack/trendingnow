import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

/** Conexão única reutilizada entre recarregamentos em desenvolvimento. */
const g = globalThis as unknown as { __trendingnowPg?: NodePgDatabase<typeof schema> };

export function getDrizzle(): NodePgDatabase<typeof schema> {
  if (g.__trendingnowPg) return g.__trendingnowPg;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  // pg trata sslmode=require como verify-full; explicitar evita o aviso e mantém o comportamento.
  const connectionString = url.replace("sslmode=require", "sslmode=verify-full");
  g.__trendingnowPg = drizzle(new Pool({ connectionString, max: 5 }), { schema });
  return g.__trendingnowPg;
}
