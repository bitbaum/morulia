import { describe, expect, it } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { decodeJwt, decodeProtectedHeader } from "jose";
import { readConfig } from "../lib/config";
import {
  appleClientSecret,
  enabledUpstreams,
  publishedProviders,
  socialProviders,
  UPSTREAMS,
  withoutClaimsRequest,
} from "../lib/upstreams";
import { CLIENT_APPS, redirectUri, registryProblems } from "../lib/clients";
import { signedOAuthQuery } from "../lib/login";
import { createSigninAuth } from "../lib/auth";
import { secretEnvName, syncClients } from "../lib/sync-clients";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "../lib/db/schema";
import { BROKER_ENV, createDatabase } from "./harness";

const applePem = generateKeyPairSync("ec", { namedCurve: "P-256" })
  .privateKey.export({ type: "pkcs8", format: "pem" })
  .toString();

const ALL = {
  GOOGLE_CLIENT_ID: "g", GOOGLE_CLIENT_SECRET: "g",
  APPLE_CLIENT_ID: "ch.example.signin", APPLE_TEAM_ID: "TEAM123456", APPLE_KEY_ID: "KEY1234567", APPLE_PRIVATE_KEY: applePem,
  GITHUB_CLIENT_ID: "h", GITHUB_CLIENT_SECRET: "h",
  X_CLIENT_ID: "x", X_CLIENT_SECRET: "x",
  META_APP_ID: "m", META_APP_SECRET: "m",
  MICROSOFT_CLIENT_ID: "ms", MICROSOFT_CLIENT_SECRET: "ms",
  LINKEDIN_CLIENT_ID: "li", LINKEDIN_CLIENT_SECRET: "li",
  DISCORD_CLIENT_ID: "d", DISCORD_CLIENT_SECRET: "d",
  GITLAB_CLIENT_ID: "gl", GITLAB_CLIENT_SECRET: "gl",
  SLACK_CLIENT_ID: "s", SLACK_CLIENT_SECRET: "s",
  TWITCH_CLIENT_ID: "t", TWITCH_CLIENT_SECRET: "t",
  REDDIT_CLIENT_ID: "r", REDDIT_CLIENT_SECRET: "r",
};
const ORDER = [
  "google", "apple", "microsoft", "facebook", "github", "linkedin",
  "twitter", "discord", "gitlab", "slack", "twitch", "reddit",
];

describe("upstream providers", () => {
  it("offers none with no env, and each one only with all of its env", () => {
    expect(enabledUpstreams({})).toEqual([]);
    expect(enabledUpstreams(ALL).map((u) => u.id)).toEqual(ORDER);
    for (const upstream of UPSTREAMS) {
      for (const missing of upstream.env) {
        const env = { ...ALL, [missing]: "  " };
        expect(enabledUpstreams(env).map((u) => u.id)).not.toContain(upstream.id);
      }
    }
  });

  it("asks no provider for an email address", async () => {
    const providers = (await socialProviders(ALL)) as Record<string, { scope?: string[]; disableDefaultScope?: boolean }>;
    expect(Object.keys(providers).sort()).toEqual([...ORDER].sort());
    for (const [id, p] of Object.entries(providers)) {
      expect(p.disableDefaultScope, id).toBe(true);
      expect((p.scope ?? []).some((s) => /email/i.test(s)), id).toBe(false);
    }
  });

  it("syncs exactly the env every provider reads (provider-keys.yml)", () => {
    const workflow = readFileSync(new URL("../.github/workflows/provider-keys.yml", import.meta.url), "utf8");
    const block = workflow.split("names: >-")[1].split("signin-on:")[0];
    expect(block.trim().split(/\s+/)).toEqual(UPSTREAMS.flatMap((u) => u.env));
  });

  it("marks Apple and X as paid, every other provider as free", () => {
    expect(UPSTREAMS.filter((u) => !u.free).map((u) => u.id)).toEqual(["apple", "twitter"]);
  });

  it("publishes names only, in button order, and only what is switched on", () => {
    expect(publishedProviders({})).toEqual({ providers: [] });
    expect(publishedProviders({ GITHUB_CLIENT_ID: "h", GITHUB_CLIENT_SECRET: "h", DISCORD_CLIENT_ID: "d", DISCORD_CLIENT_SECRET: "d" })).toEqual({
      providers: [
        { id: "github", label: "GitHub" },
        { id: "discord", label: "Discord" },
      ],
    });
    expect(JSON.stringify(publishedProviders(ALL))).not.toMatch(/"(g|h|x|m|ms|li|d|gl|s|t|r)"/);
  });

  it("asks no provider's authorize URL for claims beyond who the person is", async () => {
    const providers = await socialProviders(ALL);
    const auth = await createSigninAuth({
      database: drizzleAdapter((await createDatabase()).db, { provider: "pg", schema }),
      env: { ...BROKER_ENV, ...ALL },
    });
    expect(Object.keys(providers)).toContain("twitch");
    for (const id of Object.keys(providers)) {
      const response = await auth.api.signInSocial({
        body: { provider: id, callbackURL: "/" },
        asResponse: true,
      });
      const { url } = (await response.json()) as { url: string };
      // better-auth asks Twitch for the address in `claims`; /start removes it.
      if (id === "twitch") expect(new URL(url).searchParams.get("claims")).toMatch(/email/);
      const clean = new URL(withoutClaimsRequest(url));
      expect(clean.searchParams.has("claims"), id).toBe(false);
      expect(clean.searchParams.get("scope") ?? "", id).not.toMatch(/email/i);
    }
  });

  it("mints Apple's client secret from the team key", async () => {
    const now = Date.UTC(2026, 9, 30);
    const jwt = await appleClientSecret(ALL, now);
    expect(decodeProtectedHeader(jwt)).toMatchObject({ alg: "ES256", kid: "KEY1234567" });
    const claims = decodeJwt(jwt);
    expect(claims).toMatchObject({ iss: "TEAM123456", sub: "ch.example.signin", aud: "https://appleid.apple.com" });
    expect(claims.exp! - claims.iat!).toBeLessThanOrEqual(180 * 24 * 3600);
  });
});

describe("config", () => {
  it("refuses to start in production without its three values", () => {
    expect(() => readConfig({ NODE_ENV: "production" })).toThrow(/SIGNIN_URL/);
    expect(() => readConfig({ NODE_ENV: "production", SIGNIN_URL: "https://signin.example" })).toThrow(/BETTER_AUTH_SECRET/);
    expect(() =>
      readConfig({ NODE_ENV: "production", SIGNIN_URL: "https://signin.example", BETTER_AUTH_SECRET: "s".repeat(32) }),
    ).toThrow(/SIGNIN_PAIRWISE_SECRET/);
  });

  it("takes the issuer as an origin only", () => {
    const base = { NODE_ENV: "production", BETTER_AUTH_SECRET: "s".repeat(32), SIGNIN_PAIRWISE_SECRET: "p".repeat(32) };
    expect(readConfig({ ...base, SIGNIN_URL: "https://signin.example" }).url).toBe("https://signin.example");
    expect(() => readConfig({ ...base, SIGNIN_URL: "http://signin.example" })).toThrow();
    expect(() => readConfig({ ...base, SIGNIN_URL: "https://signin.example/auth" })).toThrow();
  });
});

describe("client registry", () => {
  it("is sound as committed", () => {
    expect(registryProblems(CLIENT_APPS)).toEqual([]);
  });

  it("uses the callback accountkit's OIDC provider sends", () => {
    expect(redirectUri({ origin: "https://heidi.orangecat.ch" })).toBe(
      "https://heidi.orangecat.ch/api/auth/callback/bitbaum-signin",
    );
  });

  it("refuses two apps on one host (they would share a subject)", () => {
    expect(
      registryProblems([
        { id: "a", name: "A", origin: "https://x.example" },
        { id: "b", name: "B", origin: "https://x.example" },
      ]).join(),
    ).toMatch(/already another app's host/);
  });

  it("refuses plain http, paths and bad ids", () => {
    expect(registryProblems([{ id: "A b", name: "x", origin: "http://x.example/path" }])).toHaveLength(3);
  });
});

describe("the sign-in page's form", () => {
  it("posts back exactly the signed parameters", () => {
    const page = new URLSearchParams(
      "client_id=heidi&scope=openid&ba_param=ba_param&ba_param=client_id&ba_param=exp&ba_param=scope&exp=9&sig=abc&utm=injected",
    );
    const signed = new URLSearchParams(signedOAuthQuery(page)!);
    expect(signed.get("utm")).toBeNull();
    expect(signed.get("sig")).toBe("abc");
    expect(signed.getAll("ba_param")).toHaveLength(4);
  });

  it("has nothing to post without a signature", () => {
    expect(signedOAuthQuery({ client_id: "heidi" })).toBeNull();
  });
});

describe("clients sync", () => {
  it("activates apps whose secret is in env, waits for the rest, retires what left", async () => {
    const database = await createDatabase();
    const auth = await createSigninAuth({
      database: drizzleAdapter(database.db, { provider: "pg", schema }),
      env: BROKER_ENV,
    });
    const apps = [
      { id: "heidi", name: "Heidi", origin: "https://heidi.orangecat.ch" },
      { id: "solon", name: "Solon", origin: "https://solon.orangecat.ch" },
    ];
    const heidiSecret = "h".repeat(43);
    const env = { [secretEnvName("heidi")]: heidiSecret, [secretEnvName("solon")]: "too-short" };
    expect(secretEnvName("surf-your-life")).toBe("SIGNIN_CLIENT_SECRET_SURF_YOUR_LIFE");

    const first = await syncClients(auth, apps, env);
    expect(first).toEqual({ active: ["heidi"], waiting: ["solon"], retired: [] });
    const stored = await database.client.query<{ client_secret: string }>(
      `select client_secret from oauth_client where client_id = 'heidi'`,
    );
    expect(stored.rows[0].client_secret).not.toContain(heidiSecret);

    const again = await syncClients(auth, apps, { ...env, [secretEnvName("solon")]: "s".repeat(43) });
    expect(again.active).toEqual(["heidi", "solon"]);

    const shrunk = await syncClients(auth, apps.slice(0, 1), env);
    expect(shrunk.retired).toEqual(["solon"]);
    const rows = await database.client.query(
      `select client_id, disabled, skip_consent, subject_type, require_pkce, token_endpoint_auth_method from oauth_client order by client_id`,
    );
    expect(rows.rows).toEqual([
      { client_id: "heidi", disabled: false, skip_consent: true, subject_type: "pairwise", require_pkce: true, token_endpoint_auth_method: "client_secret_post" },
      { client_id: "solon", disabled: true, skip_consent: true, subject_type: "pairwise", require_pkce: true, token_endpoint_auth_method: "client_secret_post" },
    ]);
  });
});
