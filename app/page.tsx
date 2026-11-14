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
  if (value.name === name || value.account === name || value.title === name) return value;
  for (const child of Object.values(value)) { const r = findNamed(child, name); if (r) return r; }
  return null;
}
function accountRecord(root: any, name: string) {
  return findNamed(root, name) ?? (Array.isArray(root) ? root.find((x:any)=>x.name===name || x.account===name) : null);
}
function fmt(v: any) { return typeof v === "number" ? v.toLocaleString("en-US") : (v ?? "Not provided"); }
function arr(v:any): any[] { return Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : []; }
function relationship(v:string) { return (v || "unknown").replaceAll("_"," "); }

function buildActions(account:any, signals:any[]) {
  const isA = account?.id === "A" || account?.name === accountNames[0];
  if (isA) return [
    { priority:"P1", title:"Resolve Westmere's urgent event request", owner:"CSM (recommended)", timing:"This week; event is 5 December", detail:"Confirm operator-training dates and numbers, plus named failure support contact and response time.", refs:["urgent_request","FB-11206","A/emails/2026-11-18_karen_event.txt"] },
    { priority:"P2", title:"Deliver the Tarn Valley data-flow pack", owner:"Engineering for pack; CSM owns delivery", timing:"Engineering estimate: one week; DPO needs documents to complete DPIA in three weeks", detail:"Send flows, retention periods, video storage location and access controls; chase the four-month-old unassigned request.", refs:["fo_dpia_2","fo_needs_3","pj_ticket","srv_dataflow","support_ticket_history"] },
    { priority:"P3", title:"De-risk Rhys Calder's January handover", owner:"CSM (recommended)", timing:"Before January handover", detail:"Build relationships with force-level finance, procurement and operational stakeholders; identify the successor when named.", refs:["champion_leaves","A/emails/2026-11-17_rhys_moving.txt","rc_funding_2","hd_calloff_2"] }
  ];
  return [
    { priority:"P1", title:"Capture the rollout playbook before the deputy leaves", owner:"CSM + Beatriz (recommended)", timing:"Before deputy departure; exact date not supplied", detail:"Combine Beatriz's night checklist with the deputy's installation steps and preserve the rollout know-how.", refs:["sr_repl_2","ba_playbook_2"] },
    { priority:"P2", title:"Build a finance-verifiable ROI case", owner:"CSM + Nadia + Julian (recommended)", timing:"Three guard contracts renew within four months", detail:"Use the insurer's verified 6% premium reduction and obtain measured guard-contract and incident-loss changes; exclude Stefan's unbooked €1.2m claim.", refs:["jt_prem_2","insurer_premium_letter","nr_evidence_2","nr_cost_2","sr_roi_2"] },
    { priority:"P3", title:"Validate adoption and network blockers at idle plants", owner:"CSM + Owen + plant managers (recommended)", timing:"No dated commitment supplied", detail:"Investigate Plant 11's poor network and lack of adoption before proposing additional docks or sister-company expansion.", refs:["ba_other_1","b_idle","owen_fitch"] }
  ];
}

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
  const deals = arr(active?.opportunities ?? active?.deals ?? active?.pipeline);
  const people = arr(active?.stakeholders ?? active?.people ?? active?.contacts);
  const facts = arr(active?.facts);
  const signalsRoot = payload?.signals?.items ?? payload?.signals?.signals ?? payload?.signals ?? [];
  const signals = arr(signalsRoot).filter((s:any) => !s.account || s.account === active?.id);
  const accountTitle = active?.name ?? active?.account ?? selected;
  const isA = active?.id === "A" || selected === accountNames[0];
  const actions = buildActions(active, signals);

  const summary = useMemo(() => ({
    knownDeals: deals.map((d:any) => ({
      id:d.id, name:d.title ?? d.name ?? "Unnamed opportunity",
      value:d.worth_up_to ?? d.value ?? d.amount ?? null,
      status:d.stage ?? d.status ?? "Status not supplied",
      blocker:d.blocker?.text ?? null, evidence:arr(d.evidence), deadline:d.deadline?.text ?? null
    })),
    knownPeople: people.map((p:any) => ({
      id:p.id, name:p.name ?? "Unnamed contact", role:p.role ?? "Role not supplied",
      relationship:relationship(p.relationship ?? p.trust ?? p.standing),
      available:p.available
    }))
  }), [active]);

  async function fetchSignals() {
    setNoteStatus("Fetching live signals…");
    try {
      const r=await fetch("/api/refresh",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"signals"})});
      const d=await r.json(); if(!r.ok) throw new Error(d.error ?? "Signal fetch failed");
      setPayload(p=>({...p,signals:d.result})); setNoteStatus("Live signals updated.");
    } catch(e:any) { setNoteStatus(e.message ?? "Signal fetch failed."); }
  }
  async function saveNote() {
    if (!note.trim()) return;
    setNoteStatus("Saving…");
    try {
      const r = await fetch("/api/refresh", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({account:active?.id ?? (isA?"A":"B"),kind:"next_step",title:"CRM next step",text:note}) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Write failed");
      setNoteStatus("Saved to Questathon."); setNote("");
    } catch(e:any) { setNoteStatus(e.message ?? "Could not save note."); }
  }

  return <main className="shell">
    <header className="topbar">
      <div><div className="eyebrow">QUESTATHON · CUSTOMER SUCCESS</div><h1>FlytBase <span>Command Centre</span></h1><p>Evidence-led account intelligence for Monday's review.</p></div>
      <div className="actions"><span className="live"><i/> SERVER-SIDE MCP · TOKEN NOT IN BROWSER</span><button onClick={load} disabled={loading}>{loading ? "Refreshing…" : "Fetch account snapshot"}</button><button onClick={fetchSignals}>Fetch live signals</button></div>
    </header>
    {error && <div className="error"><b>Connection needed:</b> {error}<br/>Add AQ_TOKEN in Vercel → Project → Settings → Environment Variables, then redeploy.</div>}
    <nav className="tabs">{accountNames.map(n=><button key={n} className={selected===n?"active":""} onClick={()=>setSelected(n)}>{n}</button>)}</nav>
    <section className="hero">
      <div><div className="eyebrow">ACCOUNT BRIEF · ACCOUNT {active?.id ?? "—"}</div><h2>{accountTitle}</h2><p>{active?.official_story ?? "Five questions a manager needs answered. Unknowns remain visible until source data resolves them."}</p></div>
      <div className="heroMeta"><span>Last fetched</span><b>{payload?.fetchedAt ? new Date(payload.fetchedAt).toLocaleString() : "Not connected"}</b><span>Local refresh</span><b>{lastRefresh || "—"}</b></div>
    </section>
    <section className="grid">
      <article className="panel"><div className="number">01</div><h3>What is the book worth?</h3>
        {summary.knownDeals.length ? <ul>{summary.knownDeals.map((d:any)=><li key={d.id}><b>{d.name}</b><span>{d.value==null?"Value not supplied":`Up to $${fmt(d.value)}`}</span><small>Opportunity: {d.id} · Stage: {d.status}</small>{d.blocker&&<small>Blocker: {d.blocker}</small>}{d.deadline&&<small>Deadline: {d.deadline}</small>}<small>Evidence IDs: {d.evidence.length?d.evidence.join(", "):"None supplied"}</small></li>)}</ul> : <p className="unknown">No opportunities returned for this account.</p>}
        {!isA && <div className="callout"><b>Verified customer benefit, not FlytBase revenue:</b> Julian reports a 6% insurer premium reduction across nine plants, approximately €180,000 per year. Evidence: <code>jt_prem_2</code>, <code>insurer_premium_letter</code>.</div>}
        {!isA && <div className="callout warning"><b>Do not present as realised savings:</b> Stefan's €1.2m ROI is an unverified spreadsheet projection; Finance has booked no guard-contract savings. Evidence: <code>sr_roi_2</code>, <code>nr_cost_2</code>.</div>}
      </article>
      <article className="panel"><div className="number">02</div><h3>Who holds the power?</h3>
        {summary.knownPeople.length ? <ul>{summary.knownPeople.map((p:any)=><li key={p.id}><b>{p.name}</b><span>{p.role}</span><small>Relationship: {p.relationship} · Stakeholder ID: {p.id} · {p.available===false?"Unavailable":"Available"}</small></li>)}</ul> : <p className="unknown">No stakeholder records supplied.</p>}
        <div className="callout"><b>{isA?"Buying structure:":"Buying structure:"}</b> {isA?"Each force funds from its own budget and its own CFO approves a call-off; the alliance cannot commit all four forces.":"Nadia controls finance validation, but the 40-plant sister company is outside her budget. Confirm the sister-company budget owner before treating it as qualified."} <small>Evidence: {isA?"rc_funding_2, hd_calloff_2":"nr_cost_2, nr_sister_1"}</small></div>
      </article>
      <article className="panel"><div className="number">03</div><h3>What do we do first?</h3>
        <ol className="actionsList">{actions.map((a:any)=><li key={a.priority}><b>{a.priority} · {a.title}</b><span>Owner: {a.owner}</span><small>Timing: {a.timing}</small><p>{a.detail}</p><small>Source references: {a.refs.join(", ")}</small></li>)}</ol>
      </article>
      <article className="panel"><div className="number">04</div><h3>What is about to go wrong?</h3>
        {signals.length ? signals.map((s:any)=><div className="signal" key={s.id}><b>{s.title}</b><span>{s.dated} · Signal ID: {s.id}</span><p>{s.summary}</p><small>Records: {arr(s.records).map((r:any)=>r.path ?? r.kind).join(", ")}</small></div>) : <p className="unknown">No live signals for this account have been fetched. Use “Fetch live signals”.</p>}
        {arr(active?.deadlines).map((d:any,i:number)=><div className="signal" key={i}><b>Account deadline</b><p>{d.text}</p><small>Passed: {String(d.passed)}</small></div>)}
      </article>
      <article className="panel"><div className="number">05</div><h3>What do we still not know?</h3>
        {isA ? <ul><li>Who is the successor to Rhys, and who will own the programme after January? <small>Ask Rhys / programme office. Ref: champion_leaves.</small></li><li>Which force CFOs will approve individual call-offs? <small>Confirm with each force; refs: rc_funding_2, hd_calloff_2.</small></li><li>Who owns the Westmere event support response, and what response time can be committed? <small>Confirm with support/operations. Ref: FB-11206.</small></li><li>What date does the 300-dock tender specification lock? <small>Confirm with Hannah. Ref: rc_tender_2.</small></li></ul> : <ul><li>Who owns the sister company's budget and can validate a 40-plant case? <small>Ask Stefan for sponsor and sister-company decision-maker; Nadia says it is outside her budget. Ref: nr_sister_1.</small></li><li>When exactly does the rollout deputy leave? <small>Ask Beatriz / Stefan. Ref: sr_repl_2.</small></li><li>Which guard contracts will actually change at the three renewals? <small>Validate with Nadia and plant-level owners. Ref: nr_evidence_2.</small></li><li>Can Plant 11's network and adoption blockers be resolved? <small>Ask Owen and Plant 11 manager. Ref: ba_other_1.</small></li></ul>}
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
