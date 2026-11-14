# FlytBase Command Centre — Thinking document

## Purpose
A live, evidence-led account review for Eastern Counties Police Alliance (A) and Aldermoor Industrial Group (B). The dashboard separates verified customer outcomes, potential FlytBase opportunity value, claims, blockers, stakeholders and live signals. It does not turn unsupported claims into facts.

## Commercial position
**Eastern Counties (A):** Four opportunities: renewal up to $350,000 (`a_renewal`), Tarn Valley/Norwold go-live up to $200,000 (`a_tarn`), Westmere scale (value not supplied; `a_westmere`), and 300-dock tender up to $1,500,000 (`a_tender`). These are opportunity ceilings, not booked revenue. Each force funds from its own budget and its own CFO must approve a call-off (`rc_funding_2`, `hd_calloff_2`). Operational evidence is uneven: 14/18 Westmere docks flew last month (`km_usage_1`), while Tarn Valley has never flown a live mission and Norwold only trains (`rc_appetite_2`). Tender evaluation weights cost per flight and operating model at 40% (`hd_weights_1`); the specification lacks a costed operating model (`rc_tender_2`).

**Aldermoor (B):** Renewal up to $140,000 (`b_renewal`), idle-plant expansion up to $180,000 (`b_idle`), and sister-company case up to $1,200,000 (`b_sister`) are potential opportunity values, not verified revenue. The insurer premium reduction is a separate, verified customer benefit: 6% across nine plants, approximately €180,000 annually (`jt_prem_2`, `insurer_premium_letter`). Stefan's €1.2m savings claim is not realised: it is based on a spreadsheet of hypothetical guard hours, no guard contract has been reduced and Finance has booked no savings (`sr_roi_2`, `nr_cost_2`). Nadia says the sister company is outside her budget (`nr_sister_1`).

## Power and risk
For Eastern Counties, Rhys is an alliance programme champion but leaves in January and no successor is named (`champion_leaves`). Each force's CFO controls its own call-off; Hannah owns procurement and tender evaluation; Karen is the operational stakeholder; Fatima controls DPIA completion. Westmere has an urgent written request for operator training and day-of-event failure cover before 5 December, logged as ticket `FB-11206` (`urgent_request`). Tarn Valley's DPIA is blocked by missing data-flow documents; Engineering estimates one week to produce them and the CSM owns delivery/chasing (`srv_dataflow`).

For Aldermoor, Nadia is the finance validator; Julian owns insurance evidence; Beatriz is the operational champion at Plant 7; Owen owns group IT infrastructure; Stefan is the security sponsor but his ROI evidence is unverified. The deputy's undocumented rollout knowledge may leave with him (`sr_repl_2`).

## Ranked next moves
1. **Eastern Counties:** Resolve `FB-11206` this week: confirm training capacity/dates and day-of-event support owner/response time. Recommended owner: CSM, coordinating operations/support. Event date: 5 December.
2. **Eastern Counties:** Deliver the data-flow pack (flows, retention, video storage, access controls). Engineering estimate: one week; CSM owns sending, chasing and DPO communication. Refs: `fo_needs_3`, `pj_ticket`, `srv_dataflow`.
3. **Aldermoor:** Capture the rollout playbook before the deputy leaves, combining Beatriz's night checklist and the deputy's installation process. Recommended owner: CSM with Beatriz and deputy. Exact departure date is not supplied.
4. **Aldermoor:** Build a finance-verifiable ROI case from insurer premium reduction, guard-contract changes and incident losses; do not reuse the €1.2m claim as realised savings.

## Explicit unknowns
Successor to Rhys; named day-of-event support owner and response SLA; exact tender lock date; force-by-force CFO approvals; sister-company budget owner; deputy departure date; actual guard-contract changes; Plant 11 network/adoption remediation. Each unknown is shown with the stakeholder or evidence reference that can resolve it.

## Data integrity
Source IDs are preserved as returned. “Up to” opportunity values are not treated as booked revenue. Verified insurance savings are kept separate from FlytBase pipeline. Recommended owners are labelled as recommendations, not source-assigned owners. Dates are displayed only where the source provides them or a relative deadline.
