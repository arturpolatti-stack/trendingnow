import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/server/db";
import { getStoreContext } from "@/server/session";
import { createOpportunity } from "@/server/actions";

async function Opportunities() {
  await connection();
  const list = db.opportunities.list(getStoreContext());
  if (list.length === 0) return <p>No opportunities yet.</p>;
  return (
    <ul>
      {list.map((o) => (
        <li key={o.id}>
          <Link href={`/opportunities/${o.id}`}>{o.product} — {o.audience} — {o.occasion}</Link>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "3rem auto", padding: "0 1rem" }}>
      <h1>TrendingNow</h1>
      <p>Compare opportunities using evidence you can trace. Nothing here is pre-filled: add only what you actually observed.</p>
      <h2>Opportunities</h2>
      <Suspense fallback={<p>Loading…</p>}><Opportunities /></Suspense>
      <h2>New opportunity</h2>
      <form action={createOpportunity} style={{ display: "grid", gap: ".5rem" }}>
        <label>Product <input name="product" required placeholder="Bachelorette party bundle" /></label>
        <label>Audience <input name="audience" required /></label>
        <label>Occasion / need <input name="occasion" required /></label>
        <label>Style <input name="style" /></label>
        <label>Format <input name="format" placeholder="Canva template, printable PDF" /></label>
        <button type="submit">Create</button>
      </form>
    </main>
  );
}
