import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { NotFoundError } from "@/domain/scoped-repository";
import type { Dimension, Observation } from "@/domain/types";
import { db } from "@/server/db";
import { getStoreContext } from "@/server/session";
import { addObservation, advanceStage, saveDecision } from "@/server/actions";
import { STAGES } from "@/domain/types";
import { ActionForm } from "@/app/action-form";

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
  try { opp = await db.opportunities.get(ctx, id); } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
  const all = (await db.observations.list(ctx)).filter((o) => o.opportunityId === id);
  const add = addObservation.bind(null, id);
  let decision; try { decision = await db.decisions.get(ctx, `d-${id}`); } catch (e) { if (!(e instanceof NotFoundError)) throw e; }
  let briefing; try { briefing = await db.briefings.get(ctx, `b-${id}`); } catch (e) { if (!(e instanceof NotFoundError)) throw e; }
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
      <h2>Decision</h2>
      {decision ? (
        <p>
          <span className="badge">{decision.kind === "choose" ? "Chosen" : decision.kind === "postpone" ? "Postponed" : "Rejected"}</span>{" "}
          {decision.reason}
          {decision.missingEvidence && <><br /><span className="muted">Missing evidence: {decision.missingEvidence}</span></>}
        </p>
      ) : <p className="muted">Undecided. You can also decide that the evidence is not enough.</p>}
      <ActionForm action={saveDecision.bind(null, id)} submit={decision ? "Update decision" : "Save decision"}>
        <label>Decision
          <select name="kind" defaultValue={decision?.kind ?? "choose"}>
            <option value="choose">Create this product</option>
            <option value="postpone">Wait for more evidence</option>
            <option value="reject">Reject</option>
          </select>
        </label>
        <label>Reason <textarea name="reason" rows={2} required defaultValue={decision?.reason} /></label>
        <label>If waiting: which evidence is missing? <input name="missingEvidence" defaultValue={decision?.missingEvidence} /></label>
      </ActionForm>
      {decision?.kind === "choose" && (
        <section>
          <h3>Progress <span className="muted">(reported by you; the app does not attribute sales)</span></h3>
          <p>{STAGES.map((s) => <span key={s} className="badge" style={{ marginRight: 6, opacity: STAGES.indexOf(s) <= STAGES.indexOf(decision.stage!) ? 1 : 0.4 }}>{s}</span>)}</p>
          {decision.stage !== "evaluated" && (
            <form action={advanceStage.bind(null, id)}>
              <input type="hidden" name="stage" value={STAGES[STAGES.indexOf(decision.stage!) + 1]} />
              <button type="submit">Mark as {STAGES[STAGES.indexOf(decision.stage!) + 1]}</button>
            </form>
          )}
        </section>
      )}
      <h2>Briefing</h2>
      <p><Link href={`/opportunities/${id}/briefing`}>{briefing ? "Open briefing" : "Write briefing"}</Link></p>
      <h2>Add observation</h2>
      <ActionForm action={add} submit="Save observation" resetOnSuccess>
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
      </ActionForm>
    </>
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <p><Link href="/">← Opportunities</Link></p>
      <Suspense fallback={<p>Loading…</p>}><Sheet params={params} /></Suspense>
    </main>
  );
}
