# FlytBase Command Centre — product thinking

## What it does and for whom
A manager-facing Customer Success CRM for the two Questathon accounts. It should help a Monday manager review by answering: book value, decision power, first actions, emerging risks, and unknowns. The audience is the CSM and their manager.

## How it decides
1. Read account and deal records from the Questathon MCP.
2. Preserve raw payloads so every interpretation can be audited.
3. Display a number only when a returned field and source identifier support it.
4. Separate booked/verified value from estimates and unsupported champion claims.
5. Map decision-maker, payer, user, and blocker separately; do not assume the champion is the approver.
6. Rank next steps by deadline proximity, deal impact, and whether the action resolves a named blocker. Every action must carry an owner, date, and deal reference from source data; otherwise label the missing fields.
7. Flag risks only from evidence: approaching deadlines, unresolved blockers, negative stakeholder responses, missing documents, and dependency changes.
8. Keep unknowns explicit with the person or record that can resolve them.
9. Write notes only through the documented `write_note` tool.

## What it does not do yet
The current scaffold does not yet normalize the complete live schema, build a persistent event store, poll signals automatically, compute source-linked book value, or fully score risk and stakeholder power. These require the real MCP payload/schema and persistent hosting storage. The app does not invent account IDs, deal values, or deadlines.

## How AI was used
AI helped design the data model, build the Next.js/Vercel scaffold, draft the evidence rules, and identify missing implementation work. AI-generated assumptions are not treated as customer facts; all factual account claims must be checked against MCP records and paperwork.
