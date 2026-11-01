import { SIGNIN_PROVIDER_ID } from "@bitbaum/accountkit/auth";

/**
 * The apps that may use this service. Every one is a first-party,
 * confidential OIDC client: no consent screen (the person chose the button in
 * the app), client_secret_post, PKCE required, a pairwise subject.
 *
 * An app is ONE origin. The pairwise subject is derived from the redirect
 * host (OIDC Core 8.1), so one client per host keeps "the same person in the
 * same app" stable and "the same person in two apps" unlinkable.
 *
 * The redirect URI is the one accountkit's generic OIDC provider sends:
 * `<origin>/api/auth/callback/bitbaum-signin`. The `id` is the app's
 * SIGNIN_CLIENT_ID. Its secret is written on the box by loki
 * `app-secrets.sh` into both env files (SIGNIN_CLIENT_SECRET_<ID> here,
 * SIGNIN_CLIENT_SECRET there) and is never printed; lib/sync-clients.ts
 * stores its hash at start. A row without a secret yet is stored switched off.
 *
 * Hosts come from bitbaum/loki scripts/hetzner/apps.conf (the serve register):
 * each app's address, which for vitareba is vita.orangecat.ch. The list is
 * every fleet app with a sign-in page (fleet docs/auth-parity-2026-11-01.md),
 * whatever its runtime, so the client exists before the app wires the button.
 * Adding an app is one row here and one pair row in loki app-secrets.sh.
 */
export interface ClientApp {
  /** SIGNIN_CLIENT_ID in the app's env; the apps.conf key or repo slug. */
  id: string;
  /** Shown on the sign-in page: "Continue to <name>". */
  name: string;
  /** The app's public origin, exactly as its BETTER_AUTH_URL / site.url. */
  origin: string;
}

export const CLIENT_APPS: readonly ClientApp[] = [
  { id: "aoz-begleitung", name: "AOZ Begleitung", origin: "https://aoz.orangecat.ch" },
  { id: "biaslens", name: "BiasLens", origin: "https://biaslens.orangecat.ch" },
  { id: "botsmann", name: "Botsmann", origin: "https://botsmann.orangecat.ch" },
  { id: "causius", name: "Causius", origin: "https://causius.orangecat.ch" },
  { id: "datacat", name: "DataCat", origin: "https://datacat.orangecat.ch" },
  { id: "diplodoctor", name: "Diplodoctor", origin: "https://diplodoctor.orangecat.ch" },
  { id: "evig", name: "evig", origin: "https://evig.orangecat.ch" },
  { id: "heidi", name: "Heidi", origin: "https://heidi.orangecat.ch" },
  { id: "hirnli", name: "hirnli", origin: "https://hirnli.orangecat.ch" },
  { id: "keller", name: "Keller", origin: "https://keller.orangecat.ch" },
  { id: "kivvi", name: "Kivvi", origin: "https://kivvi.orangecat.ch" },
  { id: "loki", name: "Loki", origin: "https://loki.orangecat.ch" },
  { id: "petvity", name: "Petvity", origin: "https://petvity.orangecat.ch" },
  { id: "printcraft", name: "PrintCraft", origin: "https://printcraft.orangecat.ch" },
  { id: "reparaturbonus-zh", name: "Reparaturbonus Zürich", origin: "https://reparaturbonus.orangecat.ch" },
  { id: "skif", name: "Skif", origin: "https://skif.orangecat.ch" },
  { id: "solon", name: "Solon", origin: "https://solon.orangecat.ch" },
  { id: "substrata", name: "Substrata", origin: "https://substrata.orangecat.ch" },
  { id: "surf-your-life", name: "Surf Your Life", origin: "https://surf-your-life.orangecat.ch" },
  { id: "vitareba", name: "Vita", origin: "https://vita.orangecat.ch" },
];

export const CALLBACK_PATH = `/api/auth/callback/${SIGNIN_PROVIDER_ID}`;

export function redirectUri(app: Pick<ClientApp, "origin">): string {
  return `${app.origin}${CALLBACK_PATH}`;
}

/** What is wrong with a registry, as sentences; empty when it is sound. */
export function registryProblems(apps: readonly ClientApp[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const hosts = new Set<string>();
  for (const app of apps) {
    if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(app.id))
      problems.push(`${app.id}: id must be a lowercase slug`);
    if (ids.has(app.id)) problems.push(`${app.id}: listed twice`);
    ids.add(app.id);
    let url: URL | null = null;
    try {
      url = new URL(app.origin);
    } catch {
      problems.push(`${app.id}: origin is not a URL`);
    }
    if (url) {
      const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (url.protocol !== "https:" && !local)
        problems.push(`${app.id}: origin must be https`);
      if (url.origin !== app.origin)
        problems.push(`${app.id}: origin must have no path or trailing slash`);
      if (hosts.has(url.host))
        problems.push(`${app.id}: ${url.host} is already another app's host`);
      hosts.add(url.host);
    }
    if (!app.name.trim()) problems.push(`${app.id}: name is empty`);
  }
  return problems;
}

export function clientApp(
  id: string | null | undefined,
  apps: readonly ClientApp[] = CLIENT_APPS,
): ClientApp | null {
  return apps.find((a) => a.id === id) ?? null;
}
