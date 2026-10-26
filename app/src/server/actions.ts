"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseObservationForm, parseOpportunityForm } from "@/domain/forms";
import { db } from "./db";
import { getStoreContext } from "./session";

export async function createOpportunity(formData: FormData) {
  const ctx = getStoreContext();
  const o = db.opportunities.create(ctx, parseOpportunityForm(formData, ctx.storeId, randomUUID()));
  revalidatePath("/");
  redirect(`/opportunities/${o.id}`);
}

export async function addObservation(opportunityId: string, formData: FormData) {
  const ctx = getStoreContext();
  db.opportunities.get(ctx, opportunityId); // falha se a oportunidade não for desta loja
  db.observations.create(ctx, parseObservationForm(formData, ctx.storeId, opportunityId, randomUUID()));
  revalidatePath(`/opportunities/${opportunityId}`);
}
