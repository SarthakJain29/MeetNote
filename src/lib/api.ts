import { MAX_TRANSCRIPT_CHARS } from "./transcript";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Parses a JSON body and validates the transcript field. Returns a Response on failure. */
export async function readBody(req: Request): Promise<Record<string, unknown> | Response> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") return jsonError("Body must be a JSON object");
    return body as Record<string, unknown>;
  } catch {
    return jsonError("Invalid JSON body");
  }
}

export function validTranscript(v: unknown): string | Response {
  if (typeof v !== "string" || v.trim().length < 20) return jsonError("Transcript is too short (min 20 characters).");
  if (v.length > MAX_TRANSCRIPT_CHARS) return jsonError(`Transcript is too long (max ${MAX_TRANSCRIPT_CHARS} characters).`, 413);
  return v;
}
