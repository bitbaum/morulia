# Morulia

The shared bitbaum sign-in, at https://morulia.orangecat.ch (first named
`signin`; renamed on 2026-11-01 before any app used it). One sign-in for
bitbaum apps, run once for every app: "Continue with" every provider whose
keys are set here — Google, Microsoft, Facebook, GitHub, LinkedIn, Discord,
GitLab, Slack, Twitch and Reddit are free to add; Apple and X are supported but
paid. Each app's button names exactly the providers this service publishes at
`/api/providers`, never one that is not configured.

**Adding a provider is pasting two repository secrets.** `docs/providers.md`
has every provider's console, callback URL and secret names, and why each is
or is not free. `.github/workflows/provider-keys.yml` writes the keys to the
box and switches the button on in every app by itself.

- **Each app sees a different identifier** for the same person (an OIDC
  pairwise subject), so two apps cannot join their records on it.
- **No address, no name.** Providers are asked only who the person is; an
  app asking for `email` gets a per-app `.invalid` placeholder.
- **No account is created anywhere else.** This service stores one row per
  provider identity and nothing about what the person does in any app.

Apps connect with three env values, read by `@bitbaum/accountkit/auth`:

    SIGNIN_ISSUER=https://morulia.orangecat.ch
    SIGNIN_CLIENT_ID=<the app's id in lib/clients.ts>
    SIGNIN_CLIENT_SECRET=<written on the box, same as SIGNIN_CLIENT_SECRET_<ID> here>

The `SIGNIN_*` names are generic and stay as they are. Apps still label the
button "Sign in with OrangeCat"; nothing user-facing says Morulia.

Endpoints: `/.well-known/openid-configuration`, `/api/auth/oauth2/authorize`
(PKCE S256 required), `/api/auth/oauth2/token` (`client_secret_post`),
`/api/auth/oauth2/userinfo`, `/api/auth/jwks`, `/api/health`, and
`/api/providers` (the providers switched on, with their names; public).

## Personas (future)

Not built. A person may one day hold several "lives" under one account, each
with its own identifier per app. The rule is fixed now so that day cannot
break anyone:

- **Existing subjects never change.** The root life is the account itself; its
  subject in each app stays exactly today's value, byte for byte.
- **A persona id is an additional input, for non-root lives only.** It is mixed
  into the same HMAC beside the app's host and the account id, so each life
  gets its own subject in each app, unlinkable to the root and to the others.
- **A life's id has its own id space: `life_<uuid>`.** It can never equal a
  user id, so a life can never silently fall back to the root subject. A
  persona that is not the account's own id and not `life_<uuid>` is refused,
  never hashed.

The derivation is one function, `pairwiseSub` in `lib/subject.ts`.
`test/subject.test.ts` pins today's value to a literal, so a change that would
move existing subjects fails CI.

See `AGENTS.md` for how to work in the repo and `.env.example` for every
variable.
