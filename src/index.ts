import defaultTranslations from "./translations.default.json";
import { detectLanguage, normalizeLanguageTag } from "./detectLanguage";

export type Translation = {
  title: string;
  message: string;
  titleStyle?: string;
  messageStyle?: string;
};

const BUILT_IN_LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "nl",
  "sv",
  "no",
  "nb",
  "da",
  "fi",
  "ru",
  "uk",
  "pl",
  "cs",
  "sk",
  "hu",
  "ro",
  "bg",
  "tr",
  "el",
  "ar",
  "he",
  "hi",
  "th",
  "vi",
  "id",
  "ms",
  "zh",
  "ja",
  "ko",
  "et",
  "lt",
  "lv",
  "hr",
  "sl",
  "sr",
  "mk",
  "sq",
  "is",
  "ga",
  "fa",
  "ur",
  "bn"
] as const;

export type BuiltInLanguage = (typeof BUILT_IN_LANGUAGES)[number];
export type ForceLanguage = BuiltInLanguage | (string & {});

/**
 * Options for `showConsoleWarning`.
 */
export type Options = {
  /**
   * Override built-in translations per language.
   */
  translations?: Record<string, Translation>;
  /**
   * Force a specific {@link https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag BCP 47 language tag}
   * @example `en`, `en-US`, `fr`
   */
  forceLang?: ForceLanguage;
  /**
   * Show only once per page load.
   * 
   * @default true
   */
  once?: boolean;
  /**
   * Show only in production mode.
   * 
   * @default false
   */
  productionOnly?: boolean;
  /**
   * Clear the console before logging.
   * 
   * @default false
   */
  clearConsole?: boolean;
  /**
   * Env key(s) that control `productionOnly` with boolean values.
   * 
   * @default ["CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY", "VITE_CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY", "NEXT_PUBLIC_CONSOLE_SELF_XSS_WARNING_PRODUCTION_ONLY"]
   */
  productionOnlyEnvKey?: string | string[];
  /**
   * Override warning behavior and styling defaults.
   *
   * @default {@link DEFAULT_WARNING_CONFIG}
   */
  config?: Partial<WarningConfig>;
};


export type WarningConfig = {
  /**
   * Default title style.
   * 
   * @default "color:red;font-size:48px;font-weight:bold;"
   */
  defaultTitleStyle: string;
  /**
   * Default message style.
   * 
   * @default "font-size:16px;"
   */
  defaultMessageStyle: string;
  /**
   * Default spam interval in ms.
   * 
   * @default 2000
   */
  defaultSpamIntervalMs: number;
  /**
   * Threshold used to detect open devtools.
   * 
   * @default 160
   */
  devtoolsSizeThresholdPx: number;
};

/**
 * Default warning configuration.
 *
 * @default
 * ```ts
 * {
 *   defaultTitleStyle: "color:red;font-size:48px;font-weight:bold;",
 *   defaultMessageStyle: "font-size:16px;",
 *   defaultSpamIntervalMs: 2000,
 *   devtoolsSizeThresholdPx: 160
 * }
 * ```
 */
export const DEFAULT_WARNING_CONFIG: WarningConfig = {
  defaultTitleStyle: "color:red;font-size:48px;font-weight:bold;",
  defaultMessageStyle: "font-size:16px;",
  defaultSpamIntervalMs: 2000,
  devtoolsSizeThresholdPx: 160
};

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

function isDevtoolsLikelyOpen(config: WarningConfig): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.outerWidth - window.innerWidth > config.devtoolsSizeThresholdPx ||
    window.outerHeight - window.innerHeight > config.devtoolsSizeThresholdPx
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
        "This is a developer-only browser feature.\\nIf someone told you to paste code here, it is a scam.\\nPasting code can give attackers access to your account."
    };
  const normalizedFallback: Translation = {
    ...fallback,
    title: fallback.title ? fallback.title.replace(/\\n/g, "\n") : fallback.title,
    message: fallback.message
      ? fallback.message.replace(/\\n/g, "\n")
      : fallback.message
  };

  const normalized = normalizeLanguageTag(lang);
  const primary = normalized.split("-")[0] || normalized;
  const selected = translations[normalized] || translations[primary];
  if (!selected) {
    return normalizedFallback;
  }

  const rawTitle = selected.title || normalizedFallback.title;
  const rawMessage = selected.message || normalizedFallback.message;

  return {
    title: rawTitle.replace(/\\n/g, "\n"),
    message: rawMessage.replace(/\\n/g, "\n"),
    titleStyle: selected.titleStyle,
    messageStyle: selected.messageStyle
  };
}

function logWarning(payload: WarningPayload, config: WarningConfig): void {
  if (payload.clearConsole && typeof console.clear === "function") {
    console.clear();
  }

  console.log(
    `%c${payload.title}`,
    payload.titleStyle || config.defaultTitleStyle
  );
  console.log(
    `%c${payload.message}`,
    payload.messageStyle || config.defaultMessageStyle
  );
}

function startSpam(payload: WarningPayload, config: WarningConfig): void {
  spamPayload = payload;

  if (typeof window === "undefined") {
    return;
  }

  if (spamIntervalId !== undefined) {
    return;
  }

  if (isDevtoolsLikelyOpen(config)) {
    logWarning(payload, config);
    setHasShown();
  }

  spamIntervalId = window.setInterval(() => {
    if (!spamPayload || !isDevtoolsLikelyOpen(config)) {
      return;
    }

    logWarning(spamPayload, config);
    setHasShown();
  }, config.defaultSpamIntervalMs);
}

/**
 * Log a self-XSS warning into the browser console.
 *
 * @example
 * showConsoleWarning();
 *
 * @example
 * showConsoleWarning({ forceLang: "fr", clearConsole: true });
 *
 * @example
 * showConsoleWarning({
 *   translations: {
 *     en: {
 *       title: "STOP!",
 *       message: "This is a developer-only feature.\\nDo not paste anything here."
 *     }
 *   },
 *   once: false
 * });
 */
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
    productionOnlyEnvKey,
    config: configOverrides
  } = options;

  // Merge defaults with user-provided overrides.
  const resolvedConfig: WarningConfig = {
    ...DEFAULT_WARNING_CONFIG,
    ...configOverrides
  };

  const resolvedProductionOnly =
    productionOnly ?? getConfigProductionOnly(productionOnlyEnvKey) ?? false;

  if (resolvedProductionOnly && !isProduction()) {
    return;
  }

  if (once && getHasShown()) {
    return;
  }

  const translations = mergeTranslations(translationOverrides);
  const lang = normalizeLanguageTag(forceLang || detectLanguage("en"));
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
    startSpam(payload, resolvedConfig);
    return;
  }

  logWarning(payload, resolvedConfig);

  setHasShown();
}
