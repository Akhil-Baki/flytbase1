# FlytBase Command Centre

Evidence-led Customer Success CRM for the Questathon two-account exercise.

## What it does
- Reads account data from the Questathon public MCP through a server-side route.
- Reads live signals and existing notes.
- Shows deals and contacts when their returned fields match the adapter.
- Keeps raw MCP payloads visible for auditability.
- Writes next-step notes through `write_note`.
- Never places the AQ_TOKEN in browser code.

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Put your Questathon token in `.env.local` as `AQ_TOKEN=...`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open http://localhost:3000.

## Deploy to Vercel
1. Create a new public GitHub repository and upload this project (do not upload `.env.local`).
2. Import the repository into Vercel.
3. In Vercel Project → Settings → Environment Variables, add `AQ_TOKEN` with your private token. Select Production (and Preview if needed).
4. Redeploy after adding the variable.
5. Open the deployed URL. The server route `/api/crm` reads the MCP; `/api/refresh` writes a note.
6. Test in a private browser window.

## MCP behavior
The initial dashboard load calls only `get_my_accounts`. Signals are fetched separately with the Fetch live signals button. Notes are read separately if you add a notes action. The supplied Questathon instructions state a one-call-per-minute limit per token; do not click multiple MCP actions within the same minute. The app intentionally does not poll automatically.

## Important limitations
- The Questathon account JSON schema must be inspected against the actual `get_my_accounts` response. The UI includes a raw payload audit panel because field names may differ from the generic adapter.
- A durable shared database/cache is not included. Vercel serverless memory is not durable. For a competition-grade live build, add a persistent store (e.g. Vercel Postgres or Upstash Redis) and a scheduled/triggered signal ingestion worker.
- Ranked and dated next steps, role-specific power mapping, source-level citations, and automated deadline/risk scoring must be completed after inspecting the real account schema and paperwork. The app intentionally shows unknowns rather than inventing them.
- `write_note` requires a real account identifier. The UI currently sends the selected account display name; if the MCP schema expects an ID, update the adapter using the actual returned ID.
- No source IDs or business values are fabricated.
