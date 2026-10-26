import { Suspense } from "react";
import { connection } from "next/server";
import { NotFoundError } from "@/domain/scoped-repository";
import type { StoreProfile } from "@/domain/types";
import { db } from "@/server/db";
import { getStoreContext } from "@/server/session";
import { saveProfile } from "@/server/actions";
import { ActionForm } from "../action-form";

async function Profile() {
  await connection();
  const ctx = getStoreContext();
  let p: StoreProfile | undefined;
  try { p = db.profiles.get(ctx, ctx.storeId); } catch (e) { if (!(e instanceof NotFoundError)) throw e; }
  return (
    <ActionForm action={saveProfile} submit="Save profile">
      <label>Store name <input name="name" required defaultValue={p?.name} /></label>
      <label>Market <input name="market" defaultValue={p?.market ?? "US"} /></label>
      <label>Categories <input name="categories" defaultValue={p?.categories} placeholder="Planners, party printables…" /></label>
      <label>What you can create (tools, formats) <textarea name="capacity" rows={3} defaultValue={p?.capacity} /></label>
      <label>Max effort per product (hours) <input name="maxEffortHours" type="number" step="any" min="0" defaultValue={p?.maxEffortHours ?? ""} /></label>
    </ActionForm>
  );
}

export default function StorePage() {
  return (
    <main>
      <h1>Store profile</h1>
      <p className="muted">Your capacity and effort limits. Used to judge fit — kept separate from market evidence.</p>
      <Suspense fallback={<p>Loading…</p>}><Profile /></Suspense>
    </main>
  );
}
