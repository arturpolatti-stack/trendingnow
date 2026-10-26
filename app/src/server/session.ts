import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { StoreContext } from "@/domain/scoped-repository";
import { auth } from "./auth";

/**
 * O contexto da loja vem sempre da sessão validada no servidor, nunca de
 * parâmetros da requisição (INV-01). No MVP cada usuário é dono de uma loja:
 * storeId = user.id. Sem sessão válida, redireciona para o login.
 */
export async function getStoreContext(): Promise<StoreContext> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return { storeId: session.user.id };
}
