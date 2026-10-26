import "server-only";
import { createPgRepositories, type Repositories } from "@/db/repositories";
import { getDrizzle } from "./pool";

const g = globalThis as unknown as { __trendingnowDb?: Repositories };

export const db: Repositories = new Proxy({} as Repositories, {
  get: (_, key: keyof Repositories) => (g.__trendingnowDb ??= createPgRepositories(getDrizzle()))[key],
});
