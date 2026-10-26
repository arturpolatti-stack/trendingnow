import "server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
import { getDrizzle } from "./pool";

/**
 * Login por e-mail e senha (sem provedor de e-mail ainda: sem verificação de e-mail
 * nem recuperação de senha). Cadastro aberto apenas fora de produção, até existir
 * convite ou verificação.
 */
export const auth = betterAuth({
  database: drizzleAdapter(getDrizzle(), {
    provider: "pg",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    disableSignUp: process.env.NODE_ENV === "production" && process.env.ALLOW_SIGNUP !== "true",
  },
  plugins: [nextCookies()], // deve ser o último plugin
});
