export function detectLanguage(fallback = "en"): string {
  if (typeof navigator === "undefined") {
    return fallback;
  }

  const raw =
    (Array.isArray(navigator.languages) && navigator.languages[0]) ||
    navigator.language ||
    fallback;

  if (!raw) {
    return fallback;
  }

  const normalized = raw.toLowerCase().replace("_", "-");
  return normalized.split("-")[0] || fallback;
}
