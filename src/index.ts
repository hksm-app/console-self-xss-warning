import defaultTranslations from "./translations.default.json";
import { detectLanguage } from "./detectLanguage";

export type Translation = {
  title: string;
  message: string;
  titleStyle?: string;
  messageStyle?: string;
};

export type Options = {
  translations?: Record<string, Translation>;
  forceLang?: string;
  once?: boolean;
  productionOnly?: boolean;
  clearConsole?: boolean;
  productionOnlyEnvKey?: string | string[];
};

const DEFAULT_TITLE_STYLE = "color:red;font-size:48px;font-weight:bold;";
const DEFAULT_MESSAGE_STYLE = "font-size:16px;";
const DEFAULT_SPAM_INTERVAL_MS = 2000;
const DEVTOOLS_SIZE_THRESHOLD_PX = 160;

const GLOBAL_ONCE_FLAG = "__consoleSelfXssWarningShown__";

let hasShown = false;
let spamIntervalId: number | undefined;
let spamPayload: WarningPayload | undefined;

type WarningPayload = {
  title: string;
  message: string;
  titleStyle?: string;
  messageStyle?: string;
  clearConsole: boolean;
};

function getHasShown(): boolean {
  if (hasShown) {
    return true;
  }
  if (typeof globalThis !== "undefined") {
    return Boolean((globalThis as Record<string, unknown>)[GLOBAL_ONCE_FLAG]);
  }
  return false;
}

function setHasShown(): void {
  hasShown = true;
  if (typeof globalThis !== "undefined") {
    (globalThis as Record<string, unknown>)[GLOBAL_ONCE_FLAG] = true;
  }
}

function isDevtoolsLikelyOpen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.outerWidth - window.innerWidth > DEVTOOLS_SIZE_THRESHOLD_PX ||
    window.outerHeight - window.innerHeight > DEVTOOLS_SIZE_THRESHOLD_PX
  );
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof console !== "undefined";
}

function isProduction(): boolean {
  const proc =
    typeof globalThis !== "undefined"
      ? (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process
      : undefined;
  const nodeEnv =
    proc && proc.env && typeof proc.env.NODE_ENV === "string"
      ? proc.env.NODE_ENV
      : undefined;

  if (nodeEnv) {
    return nodeEnv === "production";
  }

  const metaEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: { MODE?: string; PROD?: boolean } }).env
      : undefined;

  if (metaEnv) {
    if (typeof metaEnv.PROD === "boolean") {
      return metaEnv.PROD;
    }
    if (typeof metaEnv.MODE === "string") {
      return metaEnv.MODE === "production";
    }
  }

  return false;
}

function parseEnvBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n", "off"].includes(normalized)) {
    return false;
  }
  return undefined;
}

const DEFAULT_PRODUCTION_ONLY_ENV_KEYS = [
  "CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY",
  "VITE_CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY",
  "NEXT_PUBLIC_CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY"
];

function resolveEnvValue(
  env: Record<string, unknown> | undefined,
  keys: string[]
): unknown {
  if (!env) {
    return undefined;
  }
  for (const key of keys) {
    if (key in env) {
      return env[key];
    }
  }
  return undefined;
}

function getConfigProductionOnly(
  keys: string | string[] | undefined
): boolean | undefined {
  const keyList =
    typeof keys === "string"
      ? [keys]
      : Array.isArray(keys) && keys.length > 0
      ? keys
      : DEFAULT_PRODUCTION_ONLY_ENV_KEYS;
  const proc =
    typeof globalThis !== "undefined"
      ? (globalThis as { process?: { env?: Record<string, unknown> } }).process
      : undefined;
  const nodeEnvValue = resolveEnvValue(proc && proc.env ? proc.env : undefined, keyList);

  const metaEnv =
    typeof import.meta !== "undefined"
      ? (import.meta as { env?: Record<string, unknown> }).env
      : undefined;
  const metaValue = resolveEnvValue(metaEnv, keyList);

  return parseEnvBoolean(nodeEnvValue ?? metaValue);
}

function mergeTranslations(
  overrides?: Record<string, Translation>
): Record<string, Translation> {
  if (!overrides) {
    return defaultTranslations as Record<string, Translation>;
  }

  const merged: Record<string, Translation> = {
    ...(defaultTranslations as Record<string, Translation>),
    ...overrides
  };

  return merged;
}

function resolveTranslation(
  translations: Record<string, Translation>,
  lang: string
): Translation {
  const fallback =
    translations.en ||
    (defaultTranslations as Record<string, Translation>).en || {
      title: "STOP!",
      message:
        "This is a browser feature for developers.\nIf someone asks you to paste something here — it is a scam."
    };

  const selected = translations[lang] || translations[lang.toLowerCase()];
  if (!selected) {
    return fallback;
  }

  const rawTitle = selected.title || fallback.title;
  const rawMessage = selected.message || fallback.message;

  return {
    title: rawTitle.replace(/\\n/g, "\n"),
    message: rawMessage.replace(/\\n/g, "\n"),
    titleStyle: selected.titleStyle,
    messageStyle: selected.messageStyle
  };
}

function logWarning(payload: WarningPayload): void {
  if (payload.clearConsole && typeof console.clear === "function") {
    console.clear();
  }

  console.log(`%c${payload.title}`, payload.titleStyle || DEFAULT_TITLE_STYLE);
  console.log(
    `%c${payload.message}`,
    payload.messageStyle || DEFAULT_MESSAGE_STYLE
  );
}

function startSpam(payload: WarningPayload): void {
  spamPayload = payload;

  if (typeof window === "undefined") {
    return;
  }

  if (spamIntervalId !== undefined) {
    return;
  }

  if (isDevtoolsLikelyOpen()) {
    logWarning(payload);
    setHasShown();
  }

  spamIntervalId = window.setInterval(() => {
    if (!spamPayload || !isDevtoolsLikelyOpen()) {
      return;
    }

    logWarning(spamPayload);
    setHasShown();
  }, DEFAULT_SPAM_INTERVAL_MS);
}

export function showConsoleWarning(options: Options = {}): void {
  if (!isBrowser()) {
    return;
  }

  const {
    translations: translationOverrides,
    forceLang,
    once = true,
    productionOnly,
    clearConsole = false,
    productionOnlyEnvKey
  } = options;

  const resolvedProductionOnly =
    productionOnly ?? getConfigProductionOnly(productionOnlyEnvKey) ?? false;

  if (resolvedProductionOnly && !isProduction()) {
    return;
  }

  if (once && getHasShown()) {
    return;
  }

  const translations = mergeTranslations(translationOverrides);
  const lang = (forceLang || detectLanguage("en")).toLowerCase();
  const { title, message, titleStyle, messageStyle } = resolveTranslation(
    translations,
    lang
  );

  const payload: WarningPayload = {
    title,
    message,
    titleStyle,
    messageStyle,
    clearConsole
  };

  if (!once) {
    startSpam(payload);
    return;
  }

  logWarning(payload);

  setHasShown();
}
