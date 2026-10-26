"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateBriefing } from "@/domain/briefing";
import { ValidationError } from "@/domain/evidence";
import { parseBriefingForm, parseDecisionForm, parseObservationForm, parseOpportunityForm, parseProfileForm } from "@/domain/forms";
import { NotFoundError, type Owned, type Repository, type StoreContext } from "@/domain/scoped-repository";
import { STAGES } from "@/domain/types";
import { db } from "./db";
import { getStoreContext } from "./session";

/** Atualiza se existir na loja; cria se não. Só NotFoundError conta como "não existe". */
async function upsert<T extends Owned>(repo: Repository<T>, ctx: StoreContext, item: T): Promise<void> {
  try {
    await repo.update(ctx, item.id, item);
  } catch (e) {
    if (!(e instanceof NotFoundError)) throw e;
    await repo.create(ctx, item);
  }
}

export type FormState = { error?: string; ok?: boolean };

/** Erros de validação voltam ao formulário; qualquer outro erro continua sendo falha. */
async function guard(run: () => Promise<void>): Promise<FormState> {
  try {
    await run();
    return { ok: true };
  } catch (e) {
    if (e instanceof ValidationError || e instanceof NotFoundError) return { error: e.message };
    throw e;
  }
}

export async function saveProfile(_: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(async () => {
    await upsert(db.profiles, ctx, parseProfileForm(formData, ctx.storeId));
  });
  revalidatePath("/store");
  return res;
}

export async function createOpportunity(_: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const id = randomUUID();
  const res = await guard(async () => { await db.opportunities.create(ctx, parseOpportunityForm(formData, ctx.storeId, id)); });
  if (res.error) return res;
  revalidatePath("/");
  redirect(`/opportunities/${id}`);
}

export async function addObservation(opportunityId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(async () => {
    await db.opportunities.get(ctx, opportunityId); // falha se a oportunidade não for desta loja
    await db.observations.create(ctx, parseObservationForm(formData, ctx.storeId, opportunityId, randomUUID()));
  });
  revalidatePath(`/opportunities/${opportunityId}`);
  return res;
}

export async function saveDecision(opportunityId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(async () => {
    await db.opportunities.get(ctx, opportunityId);
    await upsert(db.decisions, ctx, parseDecisionForm(formData, ctx.storeId, opportunityId));
  });
  revalidatePath(`/opportunities/${opportunityId}`);
  return res;
}

/** Avança a etapa informada pela lojista (criação → publicação → avaliação). */
export async function advanceStage(opportunityId: string, formData: FormData) {
  const ctx = getStoreContext();
  const d = await db.decisions.get(ctx, `d-${opportunityId}`);
  const next = formData.get("stage");
  if (d.kind !== "choose" || !STAGES.includes(next as never)) throw new ValidationError("Etapa inválida");
  if (STAGES.indexOf(next as never) <= STAGES.indexOf(d.stage!)) return;
  await db.decisions.update(ctx, d.id, { stage: next as never });
  revalidatePath(`/opportunities/${opportunityId}`);
}

export async function saveBriefing(opportunityId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(async () => {
    await db.opportunities.get(ctx, opportunityId);
    const b = parseBriefingForm(formData, ctx.storeId, opportunityId);
    validateBriefing(b, await db.observations.list(ctx));
    await upsert(db.briefings, ctx, b);
  });
  revalidatePath(`/opportunities/${opportunityId}/briefing`);
  return res;
}
