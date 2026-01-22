export function normalizeLanguageTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/_/g, "-");
}

export function detectLanguage(fallback = "en"): string {
  if (typeof navigator === "undefined") {
    return normalizeLanguageTag(fallback);
  }

  const raw =
    (Array.isArray(navigator.languages) && navigator.languages[0]) ||
    navigator.language ||
    fallback;

  if (!raw) {
    return normalizeLanguageTag(fallback);
  }

  const normalized = normalizeLanguageTag(raw);
  return normalized || normalizeLanguageTag(fallback);
}
