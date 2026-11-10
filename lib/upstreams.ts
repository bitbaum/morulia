import { placeholderEmail } from "@bitbaum/accountkit/auth";
import { importPKCS8, SignJWT } from "jose";

/**
 * The upstream providers this service holds credentials for, ONCE, on behalf
 * of every app (fleet STACK.md, "Identity"). Each is switched on only when all
 * of its env is set, and is otherwise absent from the sign-in page — never a
 * button that fails.
 *
 * Every provider is asked for the least it can give: an identifier. No email
 * scope, no profile scope where the provider allows it. A value never
 * requested cannot leak, be linked on, or be handed to an app.
 */
type Env = Record<string, string | undefined>;

export type UpstreamId =
  | "google"
  | "apple"
  | "microsoft"
  | "facebook"
  | "github"
  | "linkedin"
  | "twitter"
  | "discord"
  | "gitlab"
  | "slack"
  | "twitch"
  | "reddit";

export interface Upstream {
  id: UpstreamId;
  /** What the button says after "Continue with". */
  label: string;
  /** All of these must be set for the provider to be offered. */
  env: readonly string[];
  /**
   * Whether registering with the provider and signing people in costs us
   * nothing. A paid provider keeps its code path (it costs nothing until its
   * keys are set) but is never in the owner's list of steps. Sources:
   * docs/providers.md.
   */
  free: boolean;
}

const pair = (prefix: string) => [`${prefix}_CLIENT_ID`, `${prefix}_CLIENT_SECRET`] as const;

/** Order is the order of the buttons, and of the names in an app's button. */
export const UPSTREAMS: readonly Upstream[] = [
  { id: "google", label: "Google", env: pair("GOOGLE"), free: true },
  {
    id: "apple",
    label: "Apple",
    env: ["APPLE_CLIENT_ID", "APPLE_TEAM_ID", "APPLE_KEY_ID", "APPLE_PRIVATE_KEY"],
    // Sign in with Apple needs the Apple Developer Program, 99 USD a year.
    free: false,
  },
  { id: "microsoft", label: "Microsoft", env: pair("MICROSOFT"), free: true },
  { id: "facebook", label: "Facebook", env: ["META_APP_ID", "META_APP_SECRET"], free: true },
  { id: "github", label: "GitHub", env: pair("GH"), free: true },
  { id: "linkedin", label: "LinkedIn", env: pair("LINKEDIN"), free: true },
  // The X API is pay-per-use with no free tier; each sign-in reads the user.
  { id: "twitter", label: "X", env: pair("X"), free: false },
  { id: "discord", label: "Discord", env: pair("DISCORD"), free: true },
  { id: "gitlab", label: "GitLab", env: pair("GITLAB"), free: true },
  { id: "slack", label: "Slack", env: pair("SLACK"), free: true },
  { id: "twitch", label: "Twitch", env: pair("TWITCH"), free: true },
  { id: "reddit", label: "Reddit", env: pair("REDDIT"), free: true },
];

const text = (value: string | undefined) => value?.trim() || "";

export function enabledUpstreams(env: Env): Upstream[] {
  return UPSTREAMS.filter((u) => u.env.every((name) => text(env[name])));
}

export function upstreamById(id: string, env: Env): Upstream | null {
  return enabledUpstreams(env).find((u) => u.id === id) ?? null;
}

/**
 * Who signed in, and nothing else. The stored user carries no name, no
 * picture and no provider address: its email is a reserved `.invalid`
 * placeholder derived from provider + subject (accountkit's rule), so two
 * providers that report the same address can never meet on it.
 */
export function pseudonymousUser(providerId: UpstreamId, subject: unknown) {
  const sub = String(subject ?? "");
  if (!sub) throw new Error(`${providerId}: profile has no subject`);
  return {
    name: "",
    email: placeholderEmail(providerId, sub),
    emailVerified: false,
    image: undefined,
  };
}

/** Apple's client secret is a short-lived ES256 JWT signed with the team key. */
export const APPLE_SECRET_LIFETIME_SECONDS = 150 * 24 * 60 * 60; // Apple allows 6 months
export async function appleClientSecret(env: Env, now = Date.now()): Promise<string> {
  const pem = text(env.APPLE_PRIVATE_KEY).replace(/\\n/g, "\n");
  const key = await importPKCS8(pem, "ES256");
  const iat = Math.floor(now / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: text(env.APPLE_KEY_ID) })
    .setIssuer(text(env.APPLE_TEAM_ID))
    .setSubject(text(env.APPLE_CLIENT_ID))
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(iat)
    .setExpirationTime(iat + APPLE_SECRET_LIFETIME_SECONDS)
    .sign(key);
}

/** better-auth `socialProviders` for every upstream whose env is set. */
export async function socialProviders(env: Env) {
  const on = new Set(enabledUpstreams(env).map((u) => u.id));
  const providers: Record<string, unknown> = {};
  if (on.has("google"))
    providers.google = {
      clientId: text(env.GOOGLE_CLIENT_ID),
      clientSecret: text(env.GOOGLE_CLIENT_SECRET),
      disableDefaultScope: true,
      scope: ["openid"],
      prompt: "select_account",
      mapProfileToUser: (p: { sub?: string }) => pseudonymousUser("google", p.sub),
    };
  if (on.has("apple"))
    providers.apple = {
      clientId: text(env.APPLE_CLIENT_ID),
      clientSecret: await appleClientSecret(env),
      disableDefaultScope: true,
      mapProfileToUser: (p: { sub?: string }) => pseudonymousUser("apple", p.sub),
    };
  if (on.has("github"))
    providers.github = {
      clientId: text(env.GH_CLIENT_ID),
      clientSecret: text(env.GH_CLIENT_SECRET),
      // No scope at all: GitHub then grants read access to public profile
      // data only, and /user/emails answers 404.
      disableDefaultScope: true,
      mapProfileToUser: (p: { id?: number | string }) => pseudonymousUser("github", p.id),
    };
  if (on.has("twitter"))
    providers.twitter = {
      clientId: text(env.X_CLIENT_ID),
      clientSecret: text(env.X_CLIENT_SECRET),
      // users.read needs tweet.read alongside it; no users.email, no offline.access.
      disableDefaultScope: true,
      scope: ["users.read", "tweet.read"],
      mapProfileToUser: (p: { data?: { id?: string } }) => pseudonymousUser("twitter", p.data?.id),
    };
  if (on.has("facebook"))
    providers.facebook = {
      clientId: text(env.META_APP_ID),
      clientSecret: text(env.META_APP_SECRET),
      disableDefaultScope: true,
      scope: ["public_profile"],
      mapProfileToUser: (p: { id?: string; sub?: string }) =>
        pseudonymousUser("facebook", p.sub ?? p.id),
    };
  if (on.has("microsoft"))
    providers.microsoft = {
      clientId: text(env.MICROSOFT_CLIENT_ID),
      clientSecret: text(env.MICROSOFT_CLIENT_SECRET),
      // Work, school and personal accounts. `profile` is the least Microsoft
      // allows: without it the token carries no `oid`, the stable id
      // better-auth keys the account on. No Graph call, no photo.
      tenantId: "common",
      disableDefaultScope: true,
      scope: ["openid", "profile"],
      disableProfilePhoto: true,
      mapProfileToUser: (p: { oid?: string }) => pseudonymousUser("microsoft", p.oid),
    };
  if (on.has("linkedin"))
    providers.linkedin = {
      clientId: text(env.LINKEDIN_CLIENT_ID),
      clientSecret: text(env.LINKEDIN_CLIENT_SECRET),
      // userinfo answers only with `profile`; no `email`.
      disableDefaultScope: true,
      scope: ["openid", "profile"],
      mapProfileToUser: (p: { sub?: string }) => pseudonymousUser("linkedin", p.sub),
    };
  if (on.has("discord"))
    providers.discord = {
      clientId: text(env.DISCORD_CLIENT_ID),
      clientSecret: text(env.DISCORD_CLIENT_SECRET),
      // `identify` is /users/@me without the email.
      disableDefaultScope: true,
      scope: ["identify"],
      mapProfileToUser: (p: { id?: string }) => pseudonymousUser("discord", p.id),
    };
  if (on.has("gitlab"))
    providers.gitlab = {
      clientId: text(env.GITLAB_CLIENT_ID),
      clientSecret: text(env.GITLAB_CLIENT_SECRET),
      // better-auth reads /api/v4/user, which needs read_user and nothing more.
      disableDefaultScope: true,
      scope: ["read_user"],
      mapProfileToUser: (p: { id?: number | string }) => pseudonymousUser("gitlab", p.id),
    };
  if (on.has("slack"))
    providers.slack = {
      clientId: text(env.SLACK_CLIENT_ID),
      clientSecret: text(env.SLACK_CLIENT_SECRET),
      disableDefaultScope: true,
      scope: ["openid"],
      mapProfileToUser: (p: { sub?: string; "https://slack.com/user_id"?: string }) =>
        pseudonymousUser("slack", p["https://slack.com/user_id"] ?? p.sub),
    };
  if (on.has("twitch"))
    providers.twitch = {
      clientId: text(env.TWITCH_CLIENT_ID),
      clientSecret: text(env.TWITCH_CLIENT_SECRET),
      // The ID token carries `sub` by default. better-auth also sends a
      // `claims` parameter asking for the address; /start removes it.
      disableDefaultScope: true,
      scope: ["openid"],
      mapProfileToUser: (p: { sub?: string }) => pseudonymousUser("twitch", p.sub),
    };
  if (on.has("reddit"))
    providers.reddit = {
      clientId: text(env.REDDIT_CLIENT_ID),
      clientSecret: text(env.REDDIT_CLIENT_SECRET),
      disableDefaultScope: true,
      scope: ["identity"],
      mapProfileToUser: (p: { id?: string }) => pseudonymousUser("reddit", p.id),
    };
  return providers;
}

/**
 * What /api/providers publishes: the providers switched on, in button order,
 * with the words an app's button names them by. Every accountkit app reads
 * this to label "Continue with …", so an app never names a provider that is
 * not configured here. Names only — never an id or a secret of the provider.
 */
export function publishedProviders(env: Env) {
  return {
    providers: enabledUpstreams(env).map((u) => ({ id: u.id, label: u.label })),
  };
}

/**
 * A provider's authorize URL with nothing in it that asks for more than who
 * the person is. better-auth always adds a `claims` request naming `email` to
 * some providers (Twitch) whatever the scope; it is removed here.
 */
export function withoutClaimsRequest(url: string): string {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("claims")) return url;
  parsed.searchParams.delete("claims");
  return parsed.toString();
}
