import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { NotFoundError } from "@/domain/scoped-repository";
import type { Dimension, Observation } from "@/domain/types";
import { db } from "@/server/db";
import { getStoreContext } from "@/server/session";
import { addObservation } from "@/server/actions";

const DIMENSIONS: { key: Dimension; title: string; note: string }[] = [
  { key: "attention", title: "Attention", note: "Social/search interest. Does not prove purchase intent on Etsy." },
  { key: "demand", title: "Demand", note: "Searches for products on Etsy. Not sales or conversion." },
  { key: "supply", title: "Supply & competition", note: "Sampled listings and prices. Not total market, not competitor sales." },
];

const ABSENCE_LABEL: Record<string, string> = {
  not_collected: "Not collected", unavailable: "Source unavailable", insufficient_sample: "Insufficient sample",
  stale: "Out of date", source_error: "Source error",
};

function show(o: Observation): string {
  if (o.value.kind === "absent") return ABSENCE_LABEL[o.value.state];
  return String(o.value.value);
}

async function Sheet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const ctx = getStoreContext();
  let opp;
  try { opp = db.opportunities.get(ctx, id); } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
  const all = db.observations.list(ctx).filter((o) => o.opportunityId === id);
  const add = addObservation.bind(null, id);
  return (
    <>
      <h1>{opp.product}</h1>
      <p>{opp.audience} · {opp.occasion} · {opp.style || "style n/a"} · {opp.format || "format n/a"} · {opp.market}/{opp.language}</p>
      {DIMENSIONS.map((d) => {
        const rows = all.filter((o) => o.dimension === d.key);
        return (
          <section key={d.key}>
            <h2>{d.title}</h2>
            <p><small>{d.note}</small></p>
            {rows.length === 0 ? <p><em>No evidence recorded. This is not a zero.</em></p> : (
              <table>
                <thead><tr><th>Term</th><th>Metric</th><th>Value</th><th>Period</th><th>Source</th><th>Collected</th></tr></thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td>{o.term}</td><td>{o.metric} ({o.unit})</td><td>{show(o)}</td>
                      <td>{o.periodStart && o.periodEnd ? `${o.periodStart} → ${o.periodEnd}` : "—"}</td>
                      <td><a href={o.sourceUrl} rel="noreferrer noopener">{o.source}</a> · {o.method}</td>
                      <td>{o.collectedAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}
      <h2>Add observation</h2>
      <form action={add} style={{ display: "grid", gap: ".5rem", maxWidth: 520 }}>
        <label>Dimension
          <select name="dimension">{DIMENSIONS.map((d) => <option key={d.key} value={d.key}>{d.title}</option>)}</select>
        </label>
        <label>Source <input name="source" required placeholder="Etsy Marketplace Insights" /></label>
        <label>Source link <input name="sourceUrl" type="url" required /></label>
        <label>Term / object <input name="term" required /></label>
        <label>Metric <input name="metric" required placeholder="searches" /></label>
        <label>Unit <input name="unit" required placeholder="count, relative index…" /></label>
        <label>Value type
          <select name="valueKind">
            <option value="number">Number (zero only if observed)</option>
            <option value="text">Text</option>
            {Object.entries(ABSENCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v} (no value)</option>)}
          </select>
        </label>
        <label>Number <input name="number" type="number" step="any" /></label>
        <label>Text <input name="text" /></label>
        <label>Period start <input name="periodStart" type="date" /></label>
        <label>Period end <input name="periodEnd" type="date" /></label>
        <label>Normalization (required for relative data) <input name="normalization" /></label>
        <label>Country <input name="country" defaultValue="US" /></label>
        <label>Language <input name="language" defaultValue="en" /></label>
        <button type="submit">Save observation</button>
      </form>
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main style={{ maxWidth: 960, margin: "3rem auto", padding: "0 1rem" }}>
      <p><Link href="/">← Opportunities</Link></p>
      <Suspense fallback={<p>Loading…</p>}><Sheet params={params} /></Suspense>
    </main>
  );
}
