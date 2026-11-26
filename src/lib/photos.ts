/** Réglages et contrôles communs pour les photos de véhicules (stockage Vercel Blob). */

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const PHOTO_MAX_BYTES = 15 * 1024 * 1024; // 15 Mo

/** Le stockage est-il relié au projet ? (variable ajoutée par Vercel en reliant un store Blob) */
export function isPhotoStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/** L'adresse pointe-t-elle vers notre stockage Vercel Blob ? */
export function isBlobUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

/** Adresse acceptée comme photo : image du site ("/images/…") ou adresse https. */
export function isAcceptablePhotoUrl(url: string): boolean {
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}
