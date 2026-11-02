import { publishedProviders } from "@/lib/upstreams";

export const dynamic = "force-dynamic";

/** The providers switched on, for every app's "Continue with …" button. Public. */
export function GET() {
  return Response.json(publishedProviders(process.env), {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}
