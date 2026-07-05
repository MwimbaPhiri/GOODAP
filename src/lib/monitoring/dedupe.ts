import crypto from "crypto";

/** Normalize a URL by stripping tracking params and fragments. */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    const drop = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "fbclid", "gclid"];
    drop.forEach((p) => u.searchParams.delete(p));
    return u.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** Stable hash used to prevent duplicate articles (url + title). */
export function dedupeHash(url: string, title: string): string {
  const key = `${normalizeUrl(url)}::${normalizeTitle(title)}`;
  return crypto.createHash("sha1").update(key).digest("hex");
}
