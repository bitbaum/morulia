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
  /**
   * The app's own icon, on its own origin, shown beside "Continue to <name>".
   * Taken from the icon the app's live home page links (checked 2026-11-10).
   * Absent → a letter tile in the neutral colours.
   */
  logo?: string;
  /**
   * The app's accent, `#rrggbb`, from a colour the app itself ships (its icon
   * or its design tokens; the source is noted on the row). Used only for the
   * page's edge and the logo tile, never for text, so contrast is never at
   * stake. Absent → the neutral page.
   */
  accent?: string;
}

export const CLIENT_APPS: readonly ClientApp[] = [
  // accent: the fill of its icon.svg
  { id: "aoz-begleitung", name: "AOZ Begleitung", origin: "https://aoz.orangecat.ch", logo: "https://aoz.orangecat.ch/icon.svg", accent: "#e63946" },
  { id: "biaslens", name: "BiasLens", origin: "https://biaslens.orangecat.ch", logo: "https://biaslens.orangecat.ch/icon" },
  { id: "botsmann", name: "Botsmann", origin: "https://botsmann.orangecat.ch", logo: "https://botsmann.orangecat.ch/icon.svg" },
  // accent: the fill of its icon.svg
  { id: "causius", name: "Causius", origin: "https://causius.orangecat.ch", logo: "https://causius.orangecat.ch/icon.svg", accent: "#ff5c00" },
  { id: "datacat", name: "DataCat", origin: "https://datacat.orangecat.ch", logo: "https://datacat.orangecat.ch/icon.svg" },
  // accent: the fill of its icon.svg
  { id: "diplodoctor", name: "Diplodoctor", origin: "https://diplodoctor.orangecat.ch", logo: "https://diplodoctor.orangecat.ch/icon.svg", accent: "#ff5c00" },
  { id: "evig", name: "evig", origin: "https://evig.orangecat.ch", logo: "https://evig.orangecat.ch/apple-icon.png" },
  { id: "heidi", name: "Heidi", origin: "https://heidi.orangecat.ch", logo: "https://heidi.orangecat.ch/icon.svg" },
  { id: "hirnli", name: "hirnli", origin: "https://hirnli.orangecat.ch", logo: "https://hirnli.orangecat.ch/favicon.ico" },
  { id: "keller", name: "Keller", origin: "https://keller.orangecat.ch" },
  // accent: the stroke of its icon.svg
  { id: "kivvi", name: "Kivvi", origin: "https://kivvi.orangecat.ch", logo: "https://kivvi.orangecat.ch/icon.svg", accent: "#4a8c2a" },
  { id: "loki", name: "Loki", origin: "https://loki.orangecat.ch", logo: "https://loki.orangecat.ch/icon.svg" },
  // accent: lib/config/design-tokens.ts `accent`
  { id: "petvity", name: "Petvity", origin: "https://petvity.orangecat.ch", logo: "https://petvity.orangecat.ch/icon.svg", accent: "#b8502a" },
  { id: "printcraft", name: "PrintCraft", origin: "https://printcraft.orangecat.ch", logo: "https://printcraft.orangecat.ch/icon.svg" },
  { id: "reparaturbonus-zh", name: "Reparaturbonus Zürich", origin: "https://reparaturbonus.orangecat.ch", logo: "https://reparaturbonus.orangecat.ch/logo/favicon_48.png" },
  // accent: src/app/globals.css `--accent`
  { id: "skif", name: "Skif", origin: "https://skif.orangecat.ch", logo: "https://skif.orangecat.ch/icon.svg", accent: "#2f5d50" },
  { id: "solon", name: "Solon", origin: "https://solon.orangecat.ch", logo: "https://solon.orangecat.ch/favicon.ico" },
  // accent: the fill of its icon.svg
  { id: "substrata", name: "Substrata", origin: "https://substrata.orangecat.ch", logo: "https://substrata.orangecat.ch/icon.svg", accent: "#4f8a80" },
  { id: "surf-your-life", name: "Surf Your Life", origin: "https://surf-your-life.orangecat.ch", logo: "https://surf-your-life.orangecat.ch/icon.svg" },
  // accent: the fill of its icon.svg
  { id: "vitareba", name: "Vita", origin: "https://vita.orangecat.ch", logo: "https://vita.orangecat.ch/icon.svg", accent: "#2a7a8a" },
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
    if (app.logo !== undefined) {
      let logo: URL | null = null;
      try {
        logo = new URL(app.logo);
      } catch {
        problems.push(`${app.id}: logo is not a URL`);
      }
      // The app's own icon only: a logo from anywhere else is a third party
      // learning who is signing in to what.
      if (logo && url && logo.origin !== url.origin)
        problems.push(`${app.id}: logo must be on the app's own origin`);
    }
    if (app.accent !== undefined && !/^#[0-9a-f]{6}$/.test(app.accent))
      problems.push(`${app.id}: accent must be #rrggbb, lowercase`);
  }
  return problems;
}

export function clientApp(
  id: string | null | undefined,
  apps: readonly ClientApp[] = CLIENT_APPS,
): ClientApp | null {
  return apps.find((a) => a.id === id) ?? null;
}
