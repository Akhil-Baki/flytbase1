 "use client";
import { useEffect, useMemo, useState } from "react";

type Payload = { accounts?: any; signals?: any; notes?: any; fetchedAt?: string; error?: string };
const accountNames = ["Eastern Counties Police Alliance", "Aldermoor Industrial Group"];

function collectStrings(value: any, out: string[] = []): string[] {
  if (value == null) return out;
  if (typeof value === "string") { out.push(value); return out; }
  if (Array.isArray(value)) { value.forEach(v => collectStrings(v, out)); return out; }
  if (typeof value === "object") Object.values(value).forEach(v => collectStrings(v, out));
  return out;
}
function findNamed(value: any, name: string): any {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) { for (const item of value) { const r = findNamed(item, name); if (r) return r; } return null; }
  if ((value.name === name || value.account === name || value.title === name) && value) return value;
  for (const child of Object.values(value)) { const r = findNamed(child, name); if (r) return r; }
  return null;
}
function getDeals(account: any): any[] {
  if (!account) return [];
  const candidates = account.deals ?? account.opportunities ?? account.pipeline ?? [];
  return Array.isArray(candidates) ? candidates : Object.values(candidates);
}
function getPeople(account: any): any[] {
  if (!account) return [];
  const candidates = account.people ?? account.contacts ?? account.stakeholders ?? [];
  return Array.isArray(candidates) ? candidates : Object.values(candidates);
}
function accountRecord(root: any, name: string) {
  return findNamed(root, name) ?? (Array.isArray(root) ? root.find((x:any)=>x.name===name || x.account===name) : null);
}
function fmt(v: any) { return typeof v === "number" ? v.toLocaleString() : (v ?? "Not provided"); }

export default function Home() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(accountNames[0]);
  const [note, setNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [lastRefresh, setLastRefresh] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const r = await fetch("/api/crm", { cache: "no-store" });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Could not load CRM data.");
      setPayload(data); setLastRefresh(new Date().toLocaleTimeString());
    } catch (e:any) { setError(e.message ?? "Unable to connect."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  const rawAccounts = payload?.accounts?.accounts ?? payload?.accounts?.data ?? payload?.accounts;
  const active = accountRecord(rawAccounts, selected) ?? accountRecord(payload?.accounts, selected);
  const deals = getDeals(active);
  const people = getPeople(active);
  const allText = collectStrings(active).join(" ").toLowerCase();
  const signals = payload?.signals?.items ?? payload?.signals?.signals ?? payload?.signals ?? [];
  const sourceList = active?.files ?? active?.documents ?? active?.evidence ?? [];
  const accountTitle = active?.name ?? active?.account ?? selected;

  const summary = useMemo(() => {
    const knownDeals = deals.map((d:any) => ({
      name: d.name ?? d.title ?? d.deal ?? "Unnamed opportunity",
      value: d.value ?? d.amount ?? d.book_value ?? null,
      status: d.status ?? d.stage ?? "Status not supplied",
      source: d.source_id ?? d.file_id ?? d.source ?? "Source ID not supplied"
    }));
    const knownPeople = people.map((p:any) => ({
      name: p.name ?? "Unnamed contact",
      role: p.role ?? p.title ?? "Role not supplied",
      relationship: p.relationship ?? p.trust ?? p.standing ?? "Not supplied",
      evidence: p.source_id ?? p.id ?? "No source ID supplied"
    }));
    return { knownDeals, knownPeople };
  }, [active]);

  async function saveNote() {
    if (!note.trim()) return;
    setNoteStatus("Saving…");
    try {
      const r = await fetch("/api/refresh", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({account:selected,kind:"next_step",title:"CRM next step",text:note}) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Write failed");
      setNoteStatus("Saved to Questathon."); setNote("");
    } catch(e:any) { setNoteStatus(e.message ?? "Could not save note."); }
  }

  return <main className="shell">
    <header className="topbar">
      <div><div className="eyebrow">QUESTATHON · CUSTOMER SUCCESS</div><h1>FlytBase <span>Command Centre</span></h1><p>Evidence-led account intelligence for Monday's review.</p></div>
      <div className="actions"><span className="live"><i/> SERVER-SIDE MCP · TOKEN NOT IN BROWSER</span><button onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Fetch account snapshot"}</button><button onClick={async()=>{setNoteStatus("Fetching signals…");try{const r=await fetch("/api/refresh",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"signals"})});const d=await r.json();if(!r.ok)throw new Error(d.error);setPayload(p=>({...p,signals:d.result}));setNoteStatus("Signals updated.");}catch(e:any){setNoteStatus(e.message??"Signal fetch failed.");}}}>Fetch live signals</button></div>
    </header>
    {error && <div className="error"><b>Connection needed:</b> {error}<br/>Add AQ_TOKEN in Vercel → Project → Settings → Environment Variables, then redeploy.</div>}
    <nav className="tabs">{accountNames.map(n=><button key={n} className={selected===n?"active":""} onClick={()=>setSelected(n)}>{n}</button>)}</nav>
    <section className="hero">
      <div><div className="eyebrow">ACCOUNT BRIEF</div><h2>{accountTitle}</h2><p>Five questions a manager needs answered. Unknowns remain visible until the source data resolves them.</p></div>
      <div className="heroMeta"><span>Last fetched</span><b>{payload?.fetchedAt ? new Date(payload.fetchedAt).toLocaleString() : "Not connected"}</b><span>Local refresh</span><b>{lastRefresh || "—"}</b></div>
    </section>
    <section className="grid">
      <article className="panel"><div className="number">01</div><h3>What is the book worth?</h3>
        {summary.knownDeals.length ? <ul>{summary.knownDeals.map((d:any,i:number)=><li key={i}><b>{d.name}</b><span>{d.value==null?"Value not verified":fmt(d.value)}</span><small>Status: {d.status} · Source: {d.source}</small></li>)}</ul> : <p className="unknown">Deal values not yet parsed from MCP response. Raw account data is preserved below; no totals are invented.</p>}
      </article>
      <article className="panel"><div className="number">02</div><h3>Who holds the power?</h3>
        {summary.knownPeople.length ? <ul>{summary.knownPeople.map((p:any,i:number)=><li key={i}><b>{p.name}</b><span>{p.role}</span><small>Standing: {p.relationship} · Source: {p.evidence}</small></li>)}</ul> : <p className="unknown">Decision-maker, payer, user and blocker roles are not yet mapped in the returned schema.</p>}
      </article>
      <article className="panel"><div className="number">03</div><h3>What do we do first?</h3>
        <p className="unknown">No dated action will be invented. Add ranked actions after checking account deadlines and owner fields from the live data.</p>
      </article>
      <article className="panel"><div className="number">04</div><h3>What is about to go wrong?</h3>
        <p>{Array.isArray(signals) && signals.length ? `${signals.length} live signal record(s) received.` : "No live signals returned yet."}</p>
        <p className="unknown">Deadlines, relationship risk and deal stalls will be flagged only when present in source records.</p>
      </article>
      <article className="panel"><div className="number">05</div><h3>What do we still not know?</h3>
        <ul><li>Who signs and who pays for each opportunity?</li><li>Which financial figures have independent source documents?</li><li>Which deadlines and stakeholder commitments remain current?</li></ul>
      </article>
      <article className="panel"><div className="number">LIVE</div><h3>Write a note back</h3>
        <p className="muted">Writes a next-step note to the Questathon account. It does not change deal stages.</p>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Record a verified next step, owner or risk…"/>
        <button onClick={saveNote} disabled={!note.trim()}>Save note via MCP</button><small>{noteStatus}</small>
      </article>
    </section>
    <section className="panel raw"><div className="row"><div><div className="eyebrow">AUDIT VIEW</div><h3>Raw source response</h3></div><span className="muted">Preserved as returned · no inferred IDs</span></div>
      <details><summary>Inspect account payload</summary><pre>{JSON.stringify(active ?? payload?.accounts ?? {},null,2)}</pre></details>
      <details><summary>Inspect live signals</summary><pre>{JSON.stringify(payload?.signals ?? {},null,2)}</pre></details>
      <details><summary>Inspect notes</summary><pre>{JSON.stringify(payload?.notes ?? {},null,2)}</pre></details>
    </section>
    <footer>FlytBase Command Centre · Private token stays server-side · {payload?.fetchedAt ? "Data fetched from Questathon MCP" : "Awaiting secure MCP connection"}</footer>
  </main>;
}
