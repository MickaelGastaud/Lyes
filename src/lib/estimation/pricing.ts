import { PRICING_MODEL } from "@/lib/config";
import type { Comparable } from "./types";

export interface Weighted {
  value: number;
  weight: number;
}

/** Médiane pondérée : la valeur "du milieu", en tenant compte du poids de chacun. */
export function weightedMedian(items: Weighted[]): number | null {
  const valid = items.filter((i) => i.weight > 0 && Number.isFinite(i.value));
  if (valid.length === 0) return null;
  const sorted = [...valid].sort((a, b) => a.value - b.value);
  const total = sorted.reduce((s, i) => s + i.weight, 0);
  let acc = 0;
  for (const item of sorted) {
    acc += item.weight;
    if (acc >= total / 2) return item.value;
  }
  return sorted[sorted.length - 1].value;
}

/**
 * Courbe prix / délai : délai = a + b × ratio,
 * où ratio = prix demandé / prix de référence du marché.
 * Plus le prix est élevé (ratio > 1), plus la vente prend du temps (b > 0).
 */
export interface DelayCurve {
  a: number;
  b: number;
  /** Dispersion des prix autour de la courbe (sert à la fourchette basse / haute). */
  spread: number;
  source: "données" | "modèle par défaut";
}

export function defaultCurve(): DelayCurve {
  const { defaultRatioAt30Days: r30, defaultRatioAt90Days: r90 } = PRICING_MODEL;
  const b = (90 - 30) / (r90 - r30);
  return { a: 30 - b * r30, b, spread: 0.05, source: "modèle par défaut" };
}

/**
 * Apprend la courbe à partir des ventes comparables (régression linéaire pondérée).
 * Si les données sont trop maigres ou incohérentes, on revient au modèle par défaut.
 */
export function fitDelayCurve(comparables: Comparable[], referencePrice: number): DelayCurve {
  const sold = comparables.filter((c) => c.sold && c.weight > 0);
  if (sold.length < PRICING_MODEL.minSoldForFit || referencePrice <= 0) return defaultCurve();

  const pts = sold.map((c) => ({ x: c.adjustedPrice / referencePrice, y: c.daysOnline, w: c.weight }));
  const W = pts.reduce((s, p) => s + p.w, 0);
  const mx = pts.reduce((s, p) => s + p.w * p.x, 0) / W;
  const my = pts.reduce((s, p) => s + p.w * p.y, 0) / W;
  const sxx = pts.reduce((s, p) => s + p.w * (p.x - mx) ** 2, 0);
  const sxy = pts.reduce((s, p) => s + p.w * (p.x - mx) * (p.y - my), 0);

  if (sxx === 0) return defaultCurve();
  const b = sxy / sxx;
  // Une pente négative (vendre plus cher irait plus vite) n'a pas de sens : données insuffisantes.
  if (!(b > 50)) return defaultCurve();
  const a = my - b * mx;

  // Dispersion : écart-type des ratios autour de la courbe.
  const variance =
    pts.reduce((s, p) => s + p.w * (p.x - (p.y - a) / b) ** 2, 0) / W;
  const spread = Math.min(0.08, Math.max(0.02, Math.sqrt(variance)));

  return { a, b, spread, source: "données" };
}

/** Ratio de prix permettant de vendre en `days` jours, borné à ±15 % du marché. */
export function ratioForDays(curve: DelayCurve, days: number): number {
  const ratio = (days - curve.a) / curve.b;
  return Math.min(1.15, Math.max(0.85, ratio));
}

/** Délai estimé pour un prix demandé donné. */
export function daysForPrice(curve: DelayCurve, price: number, referencePrice: number): number {
  return Math.max(1, Math.round(curve.a + curve.b * (price / referencePrice)));
}

/** Arrondit un prix à la centaine d'euros, comme sur une annonce. */
export const roundPrice = (p: number) => Math.round(p / 100) * 100;
