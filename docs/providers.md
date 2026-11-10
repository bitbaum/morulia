# Sign-in providers

Morulia holds each provider's keys once for every bitbaum app. A provider is
switched on when all of its keys are set and is otherwise absent. It is never
shown as a button that fails. The list is in `lib/upstreams.ts`.

Apps never name a provider themselves. Each AccountKit app reads
`https://morulia.orangecat.ch/api/providers` and its button names exactly what is
on there, for example "Continue with Google, GitHub or Facebook".

## Adding a provider is one step: paste two secrets

1. Register the app at the provider. The steps for each provider are below.
2. Paste the client id and secret as **repository secrets of bitbaum/morulia**:
   https://github.com/bitbaum/morulia/settings/secrets/actions/new, one secret
   per name, using the names in the table.

Nothing else is needed. Within the hour, `.github/workflows/provider-keys.yml`
does the rest. It also runs after every Morulia deploy, and you can start it
yourself from the Actions tab. It calls loki's `box-env-keys.yml`, which:

- copies the listed secrets into Morulia's env on the box and restarts Morulia when something changed;
- then runs loki `app-secrets.sh signin-on all`, which switches the button on in every client app.

The button stays off in an app whose AccountKit is older than 0.24.0, because
that version's button named a fixed list of providers. Such an app is switched
on by the first run after its AccountKit bump.

To rotate a key, paste the new value under the same name. To switch a provider
off, delete its secrets in GitHub **and** its lines in `/opt/morulia/shared/.env`.
A secret missing from GitHub never deletes anything on the box.

Every callback has the same shape:
`https://morulia.orangecat.ch/api/auth/callback/<id>`. Morulia asks every
provider only who the person is, never for an email address (README, AGENTS.md).

| Provider | id | Secrets (bitbaum/morulia) | Free? |
|---|---|---|---|
| Google | `google` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | yes |
| Microsoft | `microsoft` | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | yes |
| Facebook | `facebook` | `META_APP_ID`, `META_APP_SECRET` | yes |
| GitHub | `github` | `GH_CLIENT_ID`, `GH_CLIENT_SECRET` | yes |
| LinkedIn | `linkedin` | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | yes |
| Discord | `discord` | `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` | yes |
| GitLab | `gitlab` | `GITLAB_CLIENT_ID`, `GITLAB_CLIENT_SECRET` | yes |
| Slack | `slack` | `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET` | yes |
| Twitch | `twitch` | `TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET` | yes |
| Reddit | `reddit` | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | no fee, but Reddit must approve the app (below) |
| Apple | `apple` | `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | **no**: 99 USD a year |
| X | `twitter` | `X_CLIENT_ID`, `X_CLIENT_SECRET` | **no**: pay-per-use |

### Why each is or is not free

What each provider's own documentation says, as read on 2026-11-02:

- **Apple: paid.** "The Apple Developer Program is 99 USD per membership year".
  Sign in with Apple is listed under the program's "Services and capabilities"
  (https://developer.apple.com/programs/whats-included/). Its code stays in
  Morulia because it costs nothing until its keys are set. It is in no default
  label and no step list.
- **X: paid.** "The X API uses pay-per-usage pricing with no subscriptions",
  and the pricing page lists no free tier. "User: Read" costs $0.010 per
  resource, and Morulia reads the user once per sign-in
  (https://docs.x.com/x-api/getting-started/pricing). Its code stays, like Apple's.
- **Spotify: not added.** "Up to 5 authenticated Spotify users can use an app
  that is in development mode". Extended quota requires a registered business
  with at least 250k monthly active users
  (https://developer.spotify.com/documentation/web-api/concepts/quota-modes).
- **Reddit: no fee, gated.** Reddit's Developer Terms say Reddit "may require
  you to submit your App for Reddit's review and approval" (3.1). They also
  forbid use "as part of a service or product that is monetized" without written
  approval (4.1) (https://redditinc.com/policies/developer-terms). Reddit's
  Responsible Builder Policy page refused to load from here (HTTP 403), so this
  part is unconfirmed. The code is in place; do Reddit last, and only if Reddit
  accepts the app.
- **Bitbucket: not added yet.** It is free, but better-auth 1.7 has no built-in
  Bitbucket provider. Adding it means a `genericOAuth` provider, plus a test that
  the signed authorize query survives `/sign-in/oauth2` the way it survives
  `/sign-in/social` (oauth-provider adds its server context only on the latter).
  This is tracked here until that test exists.
- **Google, Microsoft, Facebook, GitHub, LinkedIn, Discord, GitLab, Slack,
  Twitch: free.** Each is self-serve registration at the provider, and the
  provider's own setup documentation names no fee (linked in each step below).
  Microsoft's guide asks for "an Azure account that has an active subscription"
  and links a free account
  (https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app).

## Steps per provider

Use the same app name everywhere: **bitbaum sign-in**. Homepage:
`https://morulia.orangecat.ch`. Privacy policy: `https://morulia.orangecat.ch/privacy`.

### GitHub

https://github.com/organizations/bitbaum/settings/applications/new (an OAuth app owned by the bitbaum organisation)

1. Application name `bitbaum sign-in`. Homepage URL `https://morulia.orangecat.ch`.
2. Authorization callback URL: `https://morulia.orangecat.ch/api/auth/callback/github`. Leave "Enable Device Flow" off.
3. Click **Register application**. Copy the **Client ID** into the secret `GH_CLIENT_ID`.
4. Click **Generate a new client secret**, and copy it into `GH_CLIENT_SECRET`.

The names are `GH_CLIENT_ID` and `GH_CLIENT_SECRET`, not `GITHUB_*`: GitHub Actions refuses any secret name that starts with `GITHUB_`.

There is no scope to choose. Morulia asks for none, so GitHub grants read access to public profile data only.

### Google

https://console.cloud.google.com/auth/clients (Google Auth Platform; [guide](https://support.google.com/cloud/answer/15549257))

1. If asked, register the app first under **Branding**: app name `bitbaum sign-in`,
   your support email, authorised domain `orangecat.ch`, privacy policy URL above.
2. **Audience**: User type **External**, then **Publish app**. While the app is
   "Testing", only test users can sign in.
3. **Clients → Create client**, type **Web application**, name `bitbaum sign-in`.
4. Authorized redirect URIs: `https://morulia.orangecat.ch/api/auth/callback/google`. Click **Create**.
5. Copy the Client ID into `GOOGLE_CLIENT_ID` and the client secret into
   `GOOGLE_CLIENT_SECRET`. Google shows the full secret only once.

Add no scope under **Data access**. Morulia asks for `openid` only.

### Microsoft (personal, work and school accounts)

https://entra.microsoft.com, then **Entra ID → App registrations → New registration**
([guide](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app))

1. Name `bitbaum sign-in`.
2. Supported account types: **Any Entra ID Tenant + Personal Microsoft accounts**.
3. Redirect URI: platform **Web**, `https://morulia.orangecat.ch/api/auth/callback/microsoft`. Click **Register**.
4. Copy the **Application (client) ID** into `MICROSOFT_CLIENT_ID`.
5. **Certificates & secrets → New client secret**, and copy its **Value** (not the
   Secret ID) into `MICROSOFT_CLIENT_SECRET`. Note its expiry date. When it
   expires, make a new secret and paste it under the same name.

Morulia asks for `openid profile`. `profile` is required to get `oid`, the stable id Morulia stores
([ID token claims](https://learn.microsoft.com/en-us/entra/identity-platform/id-token-claims-reference)).

### Facebook

https://developers.facebook.com/apps/creation/ ([guide](https://developers.facebook.com/docs/facebook-login/web))

1. Use case **Authenticate and request data from users with Facebook Login**. App name `bitbaum sign-in`.
2. **Facebook Login → Settings**. Under Client OAuth Settings, set Valid OAuth Redirect URIs to
   `https://morulia.orangecat.ch/api/auth/callback/facebook`.
3. **App settings → Basic**: App Domains `morulia.orangecat.ch`, Privacy Policy URL
   and User data deletion URL both `https://morulia.orangecat.ch/privacy`.
4. Copy the **App ID** into `META_APP_ID`. **Show** the App Secret and copy it into `META_APP_SECRET`.
5. Switch the app to **Live**. Until then, only the app's own admins can sign in.

Morulia asks for `public_profile` only. It needs no app review.

### LinkedIn

https://www.linkedin.com/developers/apps/new ([guide](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2))

1. App name `bitbaum sign-in`, privacy policy URL above. If the form asks for a
   LinkedIn Page, choose bitbaum's page.
2. **Products** tab: request **Sign In with LinkedIn using OpenID Connect**.
3. **Auth** tab: Authorized redirect URLs, add `https://morulia.orangecat.ch/api/auth/callback/linkedin`.
4. On the same tab, copy the **Client ID** into `LINKEDIN_CLIENT_ID` and the **Primary Client Secret** into `LINKEDIN_CLIENT_SECRET`.

Morulia asks for `openid profile`, never `email`.

### Discord

https://discord.com/developers/applications ([guide](https://docs.discord.com/developers/topics/oauth2))

1. **New Application**, name `bitbaum sign-in`.
2. **OAuth2 → Redirects**: add `https://morulia.orangecat.ch/api/auth/callback/discord`, then save.
3. On **OAuth2**, copy the **Client ID** into `DISCORD_CLIENT_ID`. **Reset Secret**, then copy it into `DISCORD_CLIENT_SECRET`.

Morulia asks for `identify`, which "allows `/users/@me` without `email`".

### GitLab

https://gitlab.com/-/user_settings/applications (avatar → **Edit profile → Access → Applications**; [guide](https://docs.gitlab.com/integration/oauth_provider/))

1. **Add new application**, name `bitbaum sign-in`.
2. Redirect URI: `https://morulia.orangecat.ch/api/auth/callback/gitlab`.
3. Scopes: tick **read_user** only.
4. **Save application**. Copy the **Application ID** into `GITLAB_CLIENT_ID` and the **Secret** into `GITLAB_CLIENT_SECRET`.

`read_user` is what better-auth's GitLab provider needs to read `/api/v4/user`. Morulia keeps only the id from it.

### Slack

https://api.slack.com/apps?new_app=1 ([guide](https://docs.slack.dev/authentication/sign-in-with-slack/))

1. **From scratch**, name `bitbaum sign-in`, and pick a workspace you own.
2. **OAuth & Permissions → Redirect URLs**: add `https://morulia.orangecat.ch/api/auth/callback/slack`, then **Save URLs**.
3. Under **User Token Scopes**, add `openid`. Add nothing else.
4. **Basic Information → App Credentials**: copy the **Client ID** into `SLACK_CLIENT_ID` and the **Client Secret** into `SLACK_CLIENT_SECRET`.
5. So that people from other workspaces can sign in: **Manage Distribution → Activate Public Distribution**.

### Twitch

https://dev.twitch.tv/console ([guide](https://dev.twitch.tv/docs/authentication/register-app/))

Twitch requires two-factor authentication on the Twitch account before the console works.

1. **Applications → Register Your Application**, name `bitbaum sign-in`. The name must be unique on Twitch.
2. OAuth Redirect URLs: `https://morulia.orangecat.ch/api/auth/callback/twitch`, then **Add**.
3. Category: any category that fits; Morulia does not depend on it. Then **Create**.
4. **Manage**: copy the **Client ID** into `TWITCH_CLIENT_ID`. Click **New Secret** and copy it into `TWITCH_CLIENT_SECRET`.

Morulia asks for `openid`. The ID token carries `sub` by default.

### Reddit (last, only if Reddit approves)

https://www.reddit.com/prefs/apps

1. **create another app**, name `bitbaum sign-in`, type **web app**.
2. redirect uri: `https://morulia.orangecat.ch/api/auth/callback/reddit`. Click **create app**.
3. The id under the app name goes into `REDDIT_CLIENT_ID`, and **secret** into `REDDIT_CLIENT_SECRET`.

If Reddit asks for a review first (Developer Terms 3.1), the app does nothing
until Reddit accepts it. Morulia asks for `identity` only.

## Checking it worked

- https://morulia.orangecat.ch/api/providers lists what is on, for example
  `{"providers":[{"id":"github","label":"GitHub"}]}`.
  https://morulia.orangecat.ch/api/health lists the same ids under `providers`.
- The run of **Provider keys** (https://github.com/bitbaum/morulia/actions/workflows/provider-keys.yml)
  shows `added` for each secret, then "Morulia providers on: …". After that comes
  one line per app: `added`, `kept`, or why the app waits.
- On an app's sign-in page (for example https://biaslens.orangecat.ch, the AccountKit canary),
  the button reads "Continue with" followed by the providers on, and only those.
