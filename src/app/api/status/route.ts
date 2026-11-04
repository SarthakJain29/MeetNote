import { resolveProvider } from "@/lib/ai";

export const dynamic = "force-dynamic";

export function GET() {
  const { provider, available } = resolveProvider();
  return Response.json({ active: provider.name, available });
}
