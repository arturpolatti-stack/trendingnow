import "server-only";
import { ScopedRepository } from "@/domain/scoped-repository";
import type { Observation, Opportunity } from "@/domain/types";

/** Armazenamento em memória (banco ainda não escolhido); perde dados ao reiniciar. */
interface Db {
  opportunities: ScopedRepository<Opportunity>;
  observations: ScopedRepository<Observation>;
}

const g = globalThis as unknown as { __trendingnowDb?: Db };
export const db: Db = (g.__trendingnowDb ??= {
  opportunities: new ScopedRepository<Opportunity>(),
  observations: new ScopedRepository<Observation>(),
});
