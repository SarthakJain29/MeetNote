/** fetch with a timeout and a readable error for non-2xx responses. */
export async function postJson(url: string, body: unknown, headers: Record<string, string>, timeoutMs = 45_000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 200);
      throw new Error(`Provider responded ${res.status}${detail ? `: ${detail}` : ""}`);
    }
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}
