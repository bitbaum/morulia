import { describe, expect, it } from "vitest";
import { COPY, LANGS, fill, listOf, pickLang, pickLangFor } from "../lib/copy";

describe("pickLang", () => {
  it("follows the browser's own order and weights", () => {
    expect(pickLang("de-CH,de;q=0.9,en;q=0.8")).toBe("de");
    expect(pickLang("en;q=0.5, fr;q=0.9")).toBe("fr");
    expect(pickLang("ru-RU, ru;q=0.9")).toBe("ru");
    expect(pickLang("rm")).toBe("rm");
  });
  it("reads Swiss German as Standard German", () => {
    expect(pickLang("gsw-CH, en;q=0.5")).toBe("de");
  });
  it("falls back to English for anything else, or nothing", () => {
    expect(pickLang("ja, zh;q=0.8")).toBe("en");
    expect(pickLang("")).toBe("en");
    expect(pickLang(null)).toBe("en");
    expect(pickLang("de;q=0")).toBe("en");
    expect(pickLang("¿?;;,,")).toBe("en");
  });
});

describe("pickLangFor", () => {
  it("speaks the app's language over the browser's", () => {
    expect(pickLangFor("de-CH", "en-US,en;q=0.9")).toBe("de");
    expect(pickLangFor("gsw de", "en")).toBe("de");
    expect(pickLangFor(["it"], "en")).toBe("it");
    expect(pickLangFor("en", "de-CH")).toBe("en");
  });
  it("takes the first of the app's languages it has words for", () => {
    expect(pickLangFor("ja rm de", "en")).toBe("rm");
  });
  it("falls back to the browser when the app sends nothing usable", () => {
    expect(pickLangFor(undefined, "fr-CH")).toBe("fr");
    expect(pickLangFor("", "ru")).toBe("ru");
    expect(pickLangFor("ja", "fr")).toBe("fr");
  });
});

describe("the copy", () => {
  it("has every line in every language, with the placeholders its sentence needs", () => {
    for (const lang of LANGS) {
      const c = COPY[lang];
      for (const [key, value] of Object.entries({ ...c, ...c.problem })) {
        if (typeof value === "string") expect(value.trim(), `${lang}.${key}`).not.toBe("");
      }
      expect(c.continueTo).toContain("{app}");
      expect(c.identifierNote).toContain("{app}");
      expect(c.continueWith).toContain("{provider}");
      expect(c.backTo).toContain("{app}");
      expect(c.sharedNameNote).toContain("{app}");
      expect(c.sharedNameNote).toContain("{providers}");
    }
  });
  it("fills every placeholder", () => {
    for (const lang of LANGS) {
      const text = fill(COPY[lang].identifierNote + COPY[lang].noProvider, { app: "Heidi" });
      expect(text).not.toMatch(/\{app\}/);
    }
  });
});

describe("listOf", () => {
  it("joins providers the way the visitor's language does", () => {
    expect(listOf("en", ["Google", "GitHub"])).toBe("Google and GitHub");
    expect(listOf("de", ["Google", "GitHub"])).toBe("Google und GitHub");
    expect(listOf("en", ["GitHub"])).toBe("GitHub");
  });
});
