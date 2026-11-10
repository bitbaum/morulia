/**
 * The words on the sign-in service's own pages, in the visitor's language.
 *
 * Every bitbaum app has its own language (Heidi is German, Swiss and Russian
 * and French and Italian and Romansh), and this page is the one screen in the
 * middle of every sign-in. It used to be English only, so a German reader
 * pressed a German button and landed on an English page. The language is read
 * from the browser's own preference (`Accept-Language`): nothing is stored,
 * nothing is asked, and a language not listed here falls back to English.
 *
 * Swiss German visitors get Standard German, like the apps' account screens.
 */
export const LANGS = ["en", "de", "fr", "it", "ru", "rm"] as const;
export type Lang = (typeof LANGS)[number];

export type Copy = {
  /** `{app}` */
  continueTo: string;
  /** `{app}` */
  identifierNote: string;
  /** `{provider}` */
  continueWith: string;
  /**
   * `{providers}` `{app}`. Google's account chooser names the shared
   * service's domain and GitHub's consent screen its OAuth app, never the
   * app the person came from; said here once so neither looks like a detour.
   */
  sharedNameNote: string;
  /** `{app}` */
  noProvider: string;
  /** `{app}` */
  backTo: string;
  privacy: string;
  /** Reached without coming from an app. */
  landingTitle: string;
  landingBody: string;
  problemTitle: string;
  problemAdvice: string;
  problem: { unknown_provider: string; start_failed: string; access_denied: string; other: string };
};

export const COPY: Record<Lang, Copy> = {
  en: {
    continueTo: "Continue to {app}",
    identifierNote: "{app} gets an identifier that only it can see. Not your name, not your address.",
    continueWith: "Continue with {provider}",
    sharedNameNote: "{providers} will show the shared sign-in service, not {app}. That is expected.",
    noProvider: "No provider is switched on yet. Go back to {app} and use another way in.",
    backTo: "Back to {app}",
    privacy: "Privacy",
    landingTitle: "bitbaum sign-in",
    landingBody: "This page signs you in to a bitbaum app. Start from the app: choose its “Continue with …” button on its sign-in page.",
    problemTitle: "Sign-in did not finish",
    problemAdvice: "Go back to the app you came from and choose the button again. Nothing was shared.",
    problem: {
      unknown_provider: "That provider is not available here.",
      start_failed: "Sign-in could not start from here.",
      access_denied: "The provider did not confirm who you are.",
      other: "Something went wrong between the provider and this page.",
    },
  },
  de: {
    continueTo: "Weiter zu {app}",
    identifierNote: "{app} erhält eine Kennung, die nur {app} sehen kann. Weder Ihren Namen noch Ihre Adresse.",
    continueWith: "Weiter mit {provider}",
    sharedNameNote: "Bei {providers} erscheint der gemeinsame Anmeldedienst, nicht {app}. Das ist so vorgesehen.",
    noProvider: "Noch ist kein Anbieter eingeschaltet. Gehen Sie zurück zu {app} und wählen Sie einen anderen Weg.",
    backTo: "Zurück zu {app}",
    privacy: "Datenschutz",
    landingTitle: "bitbaum-Anmeldung",
    landingBody: "Hier melden Sie sich bei einer bitbaum-App an. Beginnen Sie in der App: wählen Sie auf deren Anmeldeseite «Weiter mit …».",
    problemTitle: "Die Anmeldung wurde nicht abgeschlossen",
    problemAdvice: "Gehen Sie zurück zur App, von der Sie kommen, und wählen Sie den Knopf nochmals. Es wurde nichts weitergegeben.",
    problem: {
      unknown_provider: "Dieser Anbieter ist hier nicht verfügbar.",
      start_failed: "Die Anmeldung konnte von hier aus nicht gestartet werden.",
      access_denied: "Der Anbieter hat nicht bestätigt, wer Sie sind.",
      other: "Zwischen dem Anbieter und dieser Seite ist etwas schiefgelaufen.",
    },
  },
  fr: {
    continueTo: "Continuer vers {app}",
    identifierNote: "{app} reçoit un identifiant que seule {app} peut voir. Ni votre nom, ni votre adresse.",
    continueWith: "Continuer avec {provider}",
    sharedNameNote: "Chez {providers}, vous verrez le service de connexion partagé, pas {app}. C’est normal.",
    noProvider: "Aucun fournisseur n’est encore activé. Retournez à {app} et choisissez une autre façon d’entrer.",
    backTo: "Retour à {app}",
    privacy: "Confidentialité",
    landingTitle: "Connexion bitbaum",
    landingBody: "Cette page vous connecte à une application bitbaum. Commencez depuis l’application : choisissez « Continuer avec … » sur sa page de connexion.",
    problemTitle: "La connexion n’a pas abouti",
    problemAdvice: "Retournez à l’application d’où vous venez et choisissez de nouveau le bouton. Rien n’a été transmis.",
    problem: {
      unknown_provider: "Ce fournisseur n’est pas disponible ici.",
      start_failed: "La connexion n’a pas pu démarrer d’ici.",
      access_denied: "Le fournisseur n’a pas confirmé qui vous êtes.",
      other: "Quelque chose s’est mal passé entre le fournisseur et cette page.",
    },
  },
  it: {
    continueTo: "Continua su {app}",
    identifierNote: "{app} riceve un identificativo che solo {app} può vedere. Né il tuo nome né il tuo indirizzo.",
    continueWith: "Continua con {provider}",
    sharedNameNote: "Su {providers} vedrai il servizio di accesso condiviso, non {app}. È previsto.",
    noProvider: "Nessun provider è ancora attivo. Torna a {app} e scegli un altro modo di accedere.",
    backTo: "Torna a {app}",
    privacy: "Privacy",
    landingTitle: "Accesso bitbaum",
    landingBody: "Questa pagina ti fa accedere a un’app bitbaum. Parti dall’app: scegli «Continua con …» nella sua pagina di accesso.",
    problemTitle: "L’accesso non si è concluso",
    problemAdvice: "Torna all’app da cui arrivi e scegli di nuovo il pulsante. Non è stato condiviso nulla.",
    problem: {
      unknown_provider: "Questo provider non è disponibile qui.",
      start_failed: "L’accesso non ha potuto partire da qui.",
      access_denied: "Il provider non ha confermato chi sei.",
      other: "Qualcosa è andato storto tra il provider e questa pagina.",
    },
  },
  ru: {
    continueTo: "Продолжить в {app}",
    identifierNote: "{app} получает идентификатор, который видит только {app}. Ни вашего имени, ни вашего адреса.",
    continueWith: "Продолжить через {provider}",
    sharedNameNote: "На странице {providers} будет указан общий сервис входа, а не {app}. Так и задумано.",
    noProvider: "Ни один способ входа ещё не включён. Вернитесь в {app} и выберите другой.",
    backTo: "Назад в {app}",
    privacy: "Конфиденциальность",
    landingTitle: "Вход bitbaum",
    landingBody: "Эта страница выполняет вход в приложение bitbaum. Начните из приложения: выберите «Продолжить через …» на его странице входа.",
    problemTitle: "Вход не завершён",
    problemAdvice: "Вернитесь в приложение, откуда вы пришли, и нажмите кнопку ещё раз. Ничего не было передано.",
    problem: {
      unknown_provider: "Этот способ входа здесь недоступен.",
      start_failed: "Отсюда не удалось начать вход.",
      access_denied: "Провайдер не подтвердил, кто вы.",
      other: "Что-то пошло не так между провайдером и этой страницей.",
    },
  },
  rm: {
    continueTo: "Vinavant a {app}",
    identifierNote: "{app} survegn in identificatur che be {app} po vesair. Ni voss num ni vossa adressa.",
    continueWith: "Vinavant cun {provider}",
    sharedNameNote: "Tar {providers} vesais Vus il servetsch d’annunzia cuminaivel, betg {app}. Quai è previs.",
    noProvider: "Anc nagin purschider n’è activà. Turnai ad {app} e tscherni in auter mod d’entrar.",
    backTo: "Enavos tar {app}",
    privacy: "Protecziun da datas",
    landingTitle: "Annunzia bitbaum",
    landingBody: "Questa pagina Vus annunzia tar ina app bitbaum. Cumenzai en l’app: tscherni «Vinavant cun …» sin sia pagina d’annunzia.",
    problemTitle: "L’annunzia n’è betg vegnida terminada",
    problemAdvice: "Turnai a l’app da la quala Vus vegnis e tscherni anc ina giada il buttun. I n’è vegnì surdà nagut.",
    problem: {
      unknown_provider: "Quest purschider n’è betg disponibel qua.",
      start_failed: "L’annunzia n’ha betg pudì cumenzar da qua.",
      access_denied: "Il purschider n’ha betg confermà tgi che Vus essas.",
      other: "Insatge è ì mal tranter il purschider e questa pagina.",
    },
  },
};

/** The best language in an `Accept-Language` header that this service has words for. */
export function pickLang(header: string | null | undefined): Lang {
  const wanted = (header ?? "")
    .split(",")
    .map((part, index) => {
      const [tag = "", ...rest] = part.trim().split(";");
      const q = Number(rest.find((r) => r.trim().startsWith("q="))?.trim().slice(2));
      return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 1, index };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of wanted) {
    const base = tag.split("-")[0] ?? "";
    // Swiss German has no written form here; it is read in Standard German.
    const lang = base === "gsw" ? "de" : base;
    if ((LANGS as readonly string[]).includes(lang)) return lang as Lang;
  }
  return "en";
}

/** "Google and GitHub", in the visitor's language. */
export function listOf(lang: Lang, items: readonly string[]): string {
  try {
    return new Intl.ListFormat(lang, { style: "long", type: "conjunction" }).format(items);
  } catch {
    return items.join(", ");
  }
}

export function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}
