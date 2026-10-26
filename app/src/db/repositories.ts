import type { PgDatabase } from "drizzle-orm/pg-core";
import type { Repository } from "@/domain/scoped-repository";
import type {
  Briefing, Decision, Observation, Opportunity, StoreProfile,
} from "@/domain/types";
import { PgRepository } from "./pg-repository";
import { briefings, decisions, observations, opportunities, storeProfiles } from "./schema";

export interface Repositories {
  opportunities: Repository<Opportunity>;
  observations: Repository<Observation>;
  profiles: Repository<StoreProfile>;
  decisions: Repository<Decision>;
  briefings: Repository<Briefing>;
}

const iso = (v: unknown) => new Date(v as string).toISOString(); // timestamptz volta como "AAAA-MM-DD hh:mm:ss+00"
const nul = <V,>(v: V | null | undefined) => (v === null || v === undefined ? undefined : v);

export function createPgRepositories(db: PgDatabase<any, any, any>): Repositories { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    opportunities: new PgRepository<Opportunity>(db, opportunities, (o) => ({ ...o }), (r) => r as unknown as Opportunity),
    profiles: new PgRepository<StoreProfile>(db, storeProfiles, (p) => ({ ...p }), (r) => ({
      ...(r as unknown as StoreProfile), maxEffortHours: (r.maxEffortHours as number | null) ?? null,
    })),
    observations: new PgRepository<Observation>(
      db, observations, (o) => ({ ...o }),
      (r) => ({
        ...(r as unknown as Observation),
        collectedAt: iso(r.collectedAt),
        periodStart: nul(r.periodStart as string | null),
        periodEnd: nul(r.periodEnd as string | null),
        normalization: nul(r.normalization as string | null),
      }),
    ),
    decisions: new PgRepository<Decision>(
      db, decisions, (d) => ({ ...d, stage: d.stage ?? null, missingEvidence: d.missingEvidence ?? null }),
      (r) => ({
        ...(r as unknown as Decision),
        decidedAt: iso(r.decidedAt),
        stage: nul(r.stage as Decision["stage"] | null),
        missingEvidence: nul(r.missingEvidence as string | null),
      }),
    ),
    briefings: new PgRepository<Briefing>(db, briefings, (b) => ({ ...b }), (r) => r as unknown as Briefing),
  };
}
