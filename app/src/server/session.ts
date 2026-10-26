import "server-only";
import type { StoreContext } from "@/domain/scoped-repository";

/**
 * PLACEHOLDER: autenticação ainda não foi escolhida (DECISIONS.md).
 * Em desenvolvimento a loja vem de DEV_STORE_ID; em produção a função
 * falha de propósito, para que nada seja servido sem identidade real.
 * O contexto nunca vem de parâmetros da requisição (INV-01).
 */
export function getStoreContext(): StoreContext {
  if (process.env.NODE_ENV === "production") throw new Error("Autenticação não configurada");
  return { storeId: process.env.DEV_STORE_ID || "dev-store" };
}
