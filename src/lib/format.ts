const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

/** 23500 → "23 500 €" */
export const formatEur = (n: number | null | undefined) => (n === null || n === undefined ? "—" : eur.format(n));

/** 45000 → "45 000 km" */
export const formatKm = (n: number) => `${num.format(n)} km`;

export const formatNumber = (n: number) => num.format(n);

export const formatDate = (d: Date | null | undefined) =>
  d ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d) : "—";

export const FUEL_LABELS: Record<string, string> = {
  essence: "Essence",
  diesel: "Diesel",
  hybride: "Hybride",
  electrique: "Électrique",
};

export const GEARBOX_LABELS: Record<string, string> = {
  manuelle: "Manuelle",
  automatique: "Automatique",
};

/** Lit un champ JSON stocké en texte, sans planter si le contenu est invalide. */
export function parseJsonList(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
