import "server-only";
import { ScopedRepository } from "@/domain/scoped-repository";
import type { Briefing, Decision, Observation, Opportunity, StoreProfile } from "@/domain/types";

/** Armazenamento em memória (banco ainda não escolhido); perde dados ao reiniciar. */
interface Db {
  opportunities: ScopedRepository<Opportunity>;
  observations: ScopedRepository<Observation>;
  profiles: ScopedRepository<StoreProfile>;
  decisions: ScopedRepository<Decision>;
  briefings: ScopedRepository<Briefing>;
}

const g = globalThis as unknown as { __trendingnowDb?: Db };
export const db: Db = (g.__trendingnowDb ??= {
  opportunities: new ScopedRepository<Opportunity>(),
  observations: new ScopedRepository<Observation>(),
  profiles: new ScopedRepository<StoreProfile>(),
  decisions: new ScopedRepository<Decision>(),
  briefings: new ScopedRepository<Briefing>(),
});
