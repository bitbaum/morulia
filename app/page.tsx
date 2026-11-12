import type { CSSProperties } from "react";
import { headers } from "next/headers";
import { COPY, fill, listOf, pickLangFor } from "@/lib/copy";
import { clientApp } from "@/lib/clients";
import { requestingClientId, signedOAuthQuery, type PageSearchParams } from "@/lib/login";
import { enabledUpstreams } from "@/lib/upstreams";

export const dynamic = "force-dynamic";

/**
 * The sign-in page. oauth-provider sends a signed-out person here with the
 * app's authorize request, signed. Each button posts that signed query to
 * /start with one provider; no JavaScript is needed.
 */
export default async function SignIn({ searchParams }: { searchParams: Promise<PageSearchParams> }) {
  const params = await searchParams;
  // The language the app was showing (its `ui_locales`), then the browser's.
  const lang = pickLangFor(params.ui_locales, (await headers()).get("accept-language"));
  const t = COPY[lang];
  const query = signedOAuthQuery(params);
  const app = clientApp(requestingClientId(params));
  const upstreams = enabledUpstreams(process.env);

  if (!query || !app) {
    return (
      <main lang={lang}>
        <h1>{t.landingTitle}</h1>
        <p>{t.landingBody}</p>
        <p className="small">
          <a href="/privacy">{t.privacy}</a>
        </p>
      </main>
    );
  }

  // The app's own brand, from its row in lib/clients.ts: the person came from
  // Heidi and should still see Heidi here, not an anonymous form.
  const style = app.accent ? ({ "--client-accent": app.accent } as CSSProperties) : undefined;
  return (
    <main className="signin" style={style} lang={lang}>
      <header className="client">
        {app.logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- another origin's icon, no optimiser
          <img className="client-logo" src={app.logo} alt="" width={40} height={40} />
        ) : (
          <span className="client-logo client-letter" aria-hidden="true">
            {app.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="client-name">{app.name}</span>
      </header>
      <h1>{fill(t.continueTo, { app: app.name })}</h1>
      <p>{fill(t.identifierNote, { app: app.name })}</p>
      {upstreams.length === 0 ? (
        <p>{fill(t.noProvider, { app: app.name })}</p>
      ) : (
        <div className="providers">
          {upstreams.map((u) => (
            <form key={u.id} method="post" action="/start">
              <input type="hidden" name="provider" value={u.id} />
              <input type="hidden" name="oauth_query" value={query} />
              <button type="submit" className="acct-auth-button-quiet">
                {fill(t.continueWith, { provider: u.label })}
              </button>
            </form>
          ))}
          <p className="note">
            {fill(t.sharedNameNote, { app: app.name, providers: listOf(lang, upstreams.map((u) => u.label)) })}
          </p>
        </div>
      )}
      <p className="small">
        <a href={app.origin}>{fill(t.backTo, { app: app.name })}</a> · <a href="/privacy">{t.privacy}</a>
      </p>
    </main>
  );
}
