import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · bitbaum sign-in",
  description: "What this sign-in service stores, what it gives each app, and how to have it deleted.",
  robots: { index: true, follow: false },
};

/**
 * The privacy policy Meta (Facebook Login) and Apple ask for. Every sentence
 * here is what the code does, with the file that does it named in the comment
 * beside it. Change the code and this page together.
 */
export default function Privacy() {
  return (
    <main className="privacy">
      <h1>Privacy</h1>
      <p>
        This service signs you in to bitbaum apps with Google, Apple, GitHub, X or Facebook. It
        keeps as little as it can, and it gives every app a different identifier for you.
      </p>

      <h2>What we ask the provider for</h2>
      {/* lib/upstreams.ts: disableDefaultScope on every provider. */}
      <p>
        Only who you are. Google is asked for <code>openid</code>, Facebook for{" "}
        <code>public_profile</code>, X for <code>users.read</code> and <code>tweet.read</code>, and
        Apple and GitHub for no scope at all. We never ask for your email address. From the answer we
        keep one thing: the provider&apos;s identifier for you.
      </p>

      <h2>What we store</h2>
      {/* lib/db/schema.ts, lib/upstreams.ts pseudonymousUser, lib/auth.ts databaseHooks. */}
      <ul>
        <li>
          <strong>Accounts.</strong> One row per provider identity: the provider&apos;s name and its
          identifier for you. Your name and picture are not stored, and the email field holds a
          placeholder made from that identifier, which cannot receive mail. The provider&apos;s
          access, refresh and ID tokens are removed before the row is written.
        </li>
        <li>
          <strong>Sessions.</strong> While you are signed in here, a session row holds a random
          token, its expiry (24 hours, renewed at most once an hour while you use it) and your
          browser&apos;s user-agent string. Your IP address is not recorded.
        </li>
        <li>
          <strong>Tokens for apps.</strong> When an app signs you in, we store the access token (valid
          for one hour) and refresh token (valid for 30 days) we issued to that app, so they can be
          checked and revoked.
        </li>
        <li>
          <strong>Short-lived records.</strong> A sign-in in progress keeps its state and the
          one-time code for the app for a few minutes; the code expires after ten minutes.
        </li>
      </ul>
      <p>
        Nothing about what you do inside any app is sent here or stored here.
      </p>

      <h2>What each app receives</h2>
      {/* lib/subject.ts pairwiseSub, lib/auth.ts appScopedEmail. */}
      <p>
        A <strong>pairwise subject</strong>: an identifier computed from the app&apos;s address and
        your account here, different for every app. Two apps comparing their records cannot tell they
        hold the same person. An app that asks for an email address gets a placeholder made for that
        app alone, which cannot receive mail. No app receives your name, your picture, your provider
        identifier or your provider&apos;s email.
      </p>

      <h2>Cookies</h2>
      <p>
        Only the cookies sign-in needs: your session here, set when you sign in, so that a second
        bitbaum app can sign you in without asking the provider again, and the state of a sign-in
        while it is in progress. There are no analytics or advertising cookies.
      </p>

      <h2>Deleting your data</h2>
      {/* lib/auth.ts user.deleteUser; account and session rows cascade with the user. */}
      <p>
        Deleting your account here removes its provider identities and sessions with it, and every
        app&apos;s identifier for you stops working. To ask for that, or for a copy of what we hold,
        write to <a href="mailto:cato@orangecat.ch?subject=bitbaum%20sign-in%20data">cato@orangecat.ch</a>.
        Each app keeps its own account for you; delete that in the app itself.
      </p>

      <p className="small">
        <a href="/">bitbaum sign-in</a>
      </p>
    </main>
  );
}
