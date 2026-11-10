import { headers } from "next/headers";
import { COPY, fill, pickLang } from "@/lib/copy";
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
  const t = COPY[pickLang((await headers()).get("accept-language"))];
  const query = signedOAuthQuery(params);
  const app = clientApp(requestingClientId(params));
  const upstreams = enabledUpstreams(process.env);

  if (!query || !app) {
    return (
      <main>
        <h1>{t.landingTitle}</h1>
        <p>{t.landingBody}</p>
        <p className="small">
          <a href="/privacy">{t.privacy}</a>
        </p>
      </main>
    );
  }

  return (
    <main>
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
        </div>
      )}
      <p className="small">
        <a href={app.origin}>{fill(t.backTo, { app: app.name })}</a> · <a href="/privacy">{t.privacy}</a>
      </p>
    </main>
  );
}
