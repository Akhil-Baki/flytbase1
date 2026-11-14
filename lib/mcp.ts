const MCP_URL = "https://questathon.aihackerscollective.com/api/public/mcp";

export async function callMcp<T = any>(name: string, args: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.AQ_TOKEN;
  if (!token) throw new Error("AQ_TOKEN is not configured on the server.");
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name, arguments: args }
    }),
    cache: "no-store"
  });
  const raw = await response.text();
  let envelope: any;
  try { envelope = JSON.parse(raw); }
  catch { throw new Error(`MCP returned a non-JSON response (${response.status}).`); }
  if (!response.ok || envelope.error || envelope.result?.isError) {
    throw new Error(envelope.error?.message ?? envelope.result?.content?.[0]?.text ?? `MCP HTTP ${response.status}`);
  }
  const content = envelope.result?.content?.find((x: any) => x.type === "text")?.text;
  if (!content) return envelope.result as T;
  try { return JSON.parse(content) as T; }
  catch { return content as T; }
}

export function safeError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown server error";
}
