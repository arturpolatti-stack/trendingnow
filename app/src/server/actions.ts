"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateBriefing } from "@/domain/briefing";
import { ValidationError } from "@/domain/evidence";
import { parseBriefingForm, parseDecisionForm, parseObservationForm, parseOpportunityForm, parseProfileForm } from "@/domain/forms";
import { NotFoundError } from "@/domain/scoped-repository";
import { STAGES } from "@/domain/types";
import { db } from "./db";
import { getStoreContext } from "./session";

export type FormState = { error?: string; ok?: boolean };

/** Erros de validação voltam ao formulário; qualquer outro erro continua sendo falha. */
async function guard(run: () => void): Promise<FormState> {
  try {
    run();
    return { ok: true };
  } catch (e) {
    if (e instanceof ValidationError || e instanceof NotFoundError) return { error: e.message };
    throw e;
  }
}

export async function saveProfile(_: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(() => {
    const p = parseProfileForm(formData, ctx.storeId);
    try { db.profiles.update(ctx, p.id, p); } catch { db.profiles.create(ctx, p); }
  });
  revalidatePath("/store");
  return res;
}

export async function createOpportunity(_: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const id = randomUUID();
  const res = await guard(() => { db.opportunities.create(ctx, parseOpportunityForm(formData, ctx.storeId, id)); });
  if (res.error) return res;
  revalidatePath("/");
  redirect(`/opportunities/${id}`);
}

export async function addObservation(opportunityId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(() => {
    db.opportunities.get(ctx, opportunityId); // falha se a oportunidade não for desta loja
    db.observations.create(ctx, parseObservationForm(formData, ctx.storeId, opportunityId, randomUUID()));
  });
  revalidatePath(`/opportunities/${opportunityId}`);
  return res;
}

export async function saveDecision(opportunityId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(() => {
    db.opportunities.get(ctx, opportunityId);
    const d = parseDecisionForm(formData, ctx.storeId, opportunityId);
    try { db.decisions.update(ctx, d.id, { ...d, stage: d.stage }); } catch { db.decisions.create(ctx, d); }
  });
  revalidatePath(`/opportunities/${opportunityId}`);
  return res;
}

/** Avança a etapa informada pela lojista (criação → publicação → avaliação). */
export async function advanceStage(opportunityId: string, formData: FormData) {
  const ctx = getStoreContext();
  const d = db.decisions.get(ctx, `d-${opportunityId}`);
  const next = formData.get("stage");
  if (d.kind !== "choose" || !STAGES.includes(next as never)) throw new ValidationError("Etapa inválida");
  if (STAGES.indexOf(next as never) <= STAGES.indexOf(d.stage!)) return;
  db.decisions.update(ctx, d.id, { stage: next as never });
  revalidatePath(`/opportunities/${opportunityId}`);
}

export async function saveBriefing(opportunityId: string, _: FormState, formData: FormData): Promise<FormState> {
  const ctx = getStoreContext();
  const res = await guard(() => {
    db.opportunities.get(ctx, opportunityId);
    const b = parseBriefingForm(formData, ctx.storeId, opportunityId);
    const own = db.observations.list(ctx);
    validateBriefing(b, own);
    try { db.briefings.update(ctx, b.id, b); } catch { db.briefings.create(ctx, b); }
  });
  revalidatePath(`/opportunities/${opportunityId}/briefing`);
  return res;
}
