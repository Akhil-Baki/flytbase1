import { NextResponse } from "next/server";
import { callMcp, safeError } from "@/lib/mcp";

export const dynamic = "force-dynamic";

// Respect the Questathon limit: one MCP call per token per minute.
// Initial load fetches only the account snapshot. Fetch signals/notes separately later.
export async function GET() {
  try {
    const accounts = await callMcp("get_my_accounts");
    return NextResponse.json({ accounts, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 502 });
  }
}
