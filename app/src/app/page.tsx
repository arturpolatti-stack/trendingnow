import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/server/db";
import { getStoreContext } from "@/server/session";
import { createOpportunity } from "@/server/actions";
import { ActionForm } from "./action-form";

const DECISION_LABEL = { choose: "Chosen", postpone: "Postponed", reject: "Rejected" } as const;

async function Opportunities() {
  await connection();
  const ctx = await getStoreContext();
  const list = await db.opportunities.list(ctx);
  const allObs = await db.observations.list(ctx);
  const decisions = new Map((await db.decisions.list(ctx)).map((d) => [d.opportunityId, d]));
  if (list.length === 0) return <p className="muted">No opportunities yet.</p>;
  return (
    <table>
      <thead><tr><th>Opportunity</th><th>Evidence</th><th>Decision</th></tr></thead>
      <tbody>
        {list.map((o) => {
          const n = allObs.filter((x) => x.opportunityId === o.id).length;
          const d = decisions.get(o.id);
          return (
            <tr key={o.id}>
              <td><Link href={`/opportunities/${o.id}`}>{o.product}</Link><br /><span className="muted">{o.audience} · {o.occasion}</span></td>
              <td>{n} observation{n === 1 ? "" : "s"}</td>
              <td>{d ? <span className="badge">{DECISION_LABEL[d.kind]}{d.stage ? ` · ${d.stage}` : ""}</span> : <span className="muted">Undecided</span>}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default function Home() {
  return (
    <main>
      <h1>Opportunities</h1>
      <p className="muted">Compare product ideas using evidence you can trace. Nothing is pre-filled: add only what you actually observed.</p>
      <Suspense fallback={<p>Loading…</p>}><Opportunities /></Suspense>
      <h2>New opportunity</h2>
      <ActionForm action={createOpportunity} submit="Create">
        <label>Product <input name="product" required placeholder="Bachelorette party bundle" /></label>
        <label>Audience <input name="audience" required /></label>
        <label>Occasion / need <input name="occasion" required /></label>
        <label>Style <input name="style" /></label>
        <label>Format <input name="format" placeholder="Canva template, printable PDF" /></label>
      </ActionForm>
    </main>
  );
}
