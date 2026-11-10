import { describe, expect, it } from "vitest";
import config from "../next.config";

describe("response headers", () => {
  it("lets the sign-in form send its own origin, and still tells other sites nothing", async () => {
    // Found live 2026-11-10: with `Referrer-Policy: no-referrer` browsers send
    // `Origin: null` on the same-origin POST to /start, which `start()` refuses,
    // so every provider button landed on /problem?error=start_failed. The tests
    // that call the handler set `origin` by hand and could not see it.
    const rules = (await config.headers?.()) ?? [];
    const policy = rules.flatMap((rule) => rule.headers).find((h) => h.key === "Referrer-Policy")?.value;
    expect(policy).not.toBe("no-referrer");
    expect(policy).toBe("same-origin");
  });
});
