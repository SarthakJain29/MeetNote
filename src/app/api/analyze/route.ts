import { analyzeTranscript } from "@/lib/ai";
import { jsonError, readBody, validTranscript } from "@/lib/api";

export async function POST(req: Request) {
  const body = await readBody(req);
  if (body instanceof Response) return body;
  const transcript = validTranscript(body.transcript);
  if (transcript instanceof Response) return transcript;
  try {
    const r = await analyzeTranscript(transcript);
    return Response.json({ analysis: r.value, provider: r.provider, warning: r.warning });
  } catch (e) {
    console.error("analyze failed", e);
    return jsonError("Could not analyse this transcript. Please try again.", 500);
  }
}
