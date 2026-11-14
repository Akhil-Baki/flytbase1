import { NextResponse } from "next/server";
import { callMcp, safeError } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (body.action === "signals") {
      const result = await callMcp("get_signals");
      return NextResponse.json({ ok: true, result });
    }
    if (body.action === "notes") {
      const result = await callMcp("list_notes");
      return NextResponse.json({ ok: true, result });
    }
    if (!body.text || !body.account) {
      return NextResponse.json({ error: "Both account and text are required." }, { status: 400 });
    }
    const result = await callMcp("write_note", {
      account: body.account, kind: body.kind ?? "next_step",
      title: body.title ?? "CRM update", text: body.text
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: safeError(error) }, { status: 502 });
  }
}
