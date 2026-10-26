import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { NotFoundError } from "@/domain/scoped-repository";
import { BRIEFING_FIELDS, type Briefing, type BriefingField } from "@/domain/types";
import { db } from "@/server/db";
import { getStoreContext } from "@/server/session";
import { saveBriefing } from "@/server/actions";
import { ActionForm } from "@/app/action-form";

const LABEL: Record<BriefingField, string> = {
  audience: "Audience", occasion: "Occasion", need: "Need served", bundleProposal: "Bundle proposal and items (why each)",
  differentiation: "Differentiation and style references (no copying listings)", formats: "Formats, dimensions, variants",
  editableFields: "Editable Canva fields, fixed fields, English content, personalization", delivery: "Digital delivery, buyer instructions, asset licenses",
  keywords: "Candidate keywords and listing hypotheses", effort: "Estimated effort, production sequence",
  completionCriteria: "Completion criteria and open gaps",
};

function EvidencePicker({ name, options, selected }: { name: string; options: { id: string; label: string }[]; selected: string[] }) {
  if (options.length === 0) return <p className="muted">No observations yet — add evidence on the opportunity page first.</p>;
  return (
    <fieldset>
      <legend>Evidence cited</legend>
      {options.map((o) => (
        <label key={o.id} style={{ display: "flex", gap: ".5rem" }}>
          <input type="checkbox" name={name} value={o.id} defaultChecked={selected.includes(o.id)} /> {o.label}
        </label>
      ))}
    </fieldset>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const ctx = await getStoreContext();
  let opp;
  try { opp = await db.opportunities.get(ctx, id); } catch (e) { if (e instanceof NotFoundError) notFound(); throw e; }
  let b: Briefing | undefined; try { b = await db.briefings.get(ctx, `b-${id}`); } catch (e) { if (!(e instanceof NotFoundError)) throw e; }
  const options = (await db.observations.list(ctx)).filter((o) => o.opportunityId === id)
    .map((o) => ({ id: o.id, label: `${o.term} — ${o.metric}: ${o.value.kind === "absent" ? o.value.state : o.value.value} (${o.source})` }));
  return (
    <>
      <p><Link href={`/opportunities/${id}`}>← Opportunity</Link></p>
      <h1>Briefing: {opp.product}</h1>
      <p className="muted">Every reason and the uncertainty must cite evidence recorded for this opportunity. Accepted means executable, not a sales prediction.</p>
      <ActionForm action={saveBriefing.bind(null, id)} submit="Save briefing">
        {BRIEFING_FIELDS.map((f) => (
          <label key={f}>{LABEL[f]}<textarea name={f} rows={2} defaultValue={b?.fields[f]} /></label>
        ))}
        {[0, 1].map((i) => (
          <section key={i}>
            <label>Reason {i + 1}<textarea name={`reason${i + 1}`} rows={2} defaultValue={b?.reasons[i]?.text} /></label>
            <EvidencePicker name={`reason${i + 1}Ev`} options={options} selected={b?.reasons[i]?.evidenceIds ?? []} />
          </section>
        ))}
        <section>
          <label>Main uncertainty<textarea name="uncertainty" rows={2} defaultValue={b?.uncertainty.text} /></label>
          <EvidencePicker name="uncertaintyEv" options={options} selected={b?.uncertainty.evidenceIds ?? []} />
        </section>
      </ActionForm>
    </>
  );
}

export default function BriefingPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<p>Loading…</p>}><Editor params={params} /></Suspense>
    </main>
  );
}
