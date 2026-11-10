import { headers } from "next/headers";
import { COPY, pickLang } from "@/lib/copy";
import type { PageSearchParams } from "@/lib/login";

export const dynamic = "force-dynamic";

/** Never prints the provider's own code; always offers the way back. */
export default async function Problem({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const error = String((await searchParams).error ?? "");
  const t = COPY[pickLang((await headers()).get("accept-language"))];
  const words = (Object.keys(t.problem) as (keyof typeof t.problem)[]).includes(error as never)
    ? t.problem[error as keyof typeof t.problem]
    : t.problem.other;
  return (
    <main>
      <h1>{t.problemTitle}</h1>
      <p>{words}</p>
      <p>{t.problemAdvice}</p>
    </main>
  );
}
