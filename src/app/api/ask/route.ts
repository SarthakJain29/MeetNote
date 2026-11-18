import { askAboutTranscript } from "@/lib/ai";
import { jsonError, readBody, validTranscript } from "@/lib/api";

export async function POST(req: Request) {
  const body = await readBody(req);
  if (body instanceof Response) return body;
  const transcript = validTranscript(body.transcript);
  if (transcript instanceof Response) return transcript;
  const q = typeof body.question === "string" ? body.question.trim() : "";
  if (q.length < 3 || q.length > 500) return jsonError("Question must be 3-500 characters.");
  try {
    const r = await askAboutTranscript(transcript, q);
    return Response.json({ answer: r.value, provider: r.provider, warning: r.warning });
  } catch (e) {
    console.error("ask failed", e);
    return jsonError("Could not answer right now.", 500);
  }
}
