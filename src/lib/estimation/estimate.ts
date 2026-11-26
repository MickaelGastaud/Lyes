import { DEFAULT_COSTS, SALE_HORIZONS } from "@/lib/config";
import { selectComparables } from "./comparables";
import { computeMargin } from "./margin";
import { fitDelayCurve, ratioForDays, roundPrice, weightedMedian } from "./pricing";
import type {
  Confidence,
  CostInputs,
  EstimationResult,
  HorizonEstimate,
  Listing,
  VehicleSpec,
} from "./types";

/**
 * Estimation complète d'une voiture :
 * 1. trouver les comparables, 2. fixer un prix de référence,
 * 3. apprendre la courbe prix / délai, 4. calculer la marge à chaque horizon.
 *
 * Renvoie `null` si aucune annonce comparable n'existe.
 */
export function estimate(
  spec: VehicleSpec,
  listings: Listing[],
  costs: CostInputs | null,
  options: { now?: Date; horizons?: readonly number[]; minNetMargin?: number } = {},
): EstimationResult | null {
  const now = options.now ?? new Date();
  const horizons = options.horizons ?? SALE_HORIZONS;
  const minNetMargin = options.minNetMargin ?? DEFAULT_COSTS.minNetMargin;

  const comparables = selectComparables(spec, listings, now);
  if (comparables.length === 0) return null;

  const referencePrice = weightedMedian(
    comparables.map((c) => ({ value: c.adjustedPrice, weight: c.weight })),
  )!;

  const curve = fitDelayCurve(comparables, referencePrice);

  const rows: HorizonEstimate[] = horizons.map((days) => {
    const ratio = ratioForDays(curve, days);
    const price = roundPrice(referencePrice * ratio);
    return {
      days,
      price,
      low: roundPrice(referencePrice * (ratio - curve.spread)),
      high: roundPrice(referencePrice * (ratio + curve.spread)),
      margin: costs ? computeMargin(price, days, costs) : null,
    };
  });

  const sold = comparables.filter((c) => c.sold);
  const medianDaysToSell = weightedMedian(sold.map((c) => ({ value: c.daysOnline, weight: c.weight })));

  const bestHorizon = costs
    ? rows.reduce((best, r) => (r.margin!.netMargin > best.margin!.netMargin ? r : best))
    : null;

  const { score, label } = confidenceOf(comparables.length, sold.length, curve.source === "données");

  return {
    referencePrice: roundPrice(referencePrice),
    horizons: rows,
    confidence: label,
    confidenceScore: score,
    comparablesCount: comparables.length,
    soldCount: sold.length,
    curveSource: curve.source,
    medianDaysToSell: medianDaysToSell === null ? null : Math.round(medianDaysToSell),
    bestHorizon,
    isGoodDeal: bestHorizon ? bestHorizon.margin!.netMargin >= minNetMargin : null,
    comparables: [...comparables].sort((a, b) => b.weight - a.weight),
  };
}

/** Indice de confiance : plus il y a de comparables et de ventes, plus on est sûr. */
export function confidenceOf(
  comparablesCount: number,
  soldCount: number,
  curveFromData: boolean,
): { score: number; label: Confidence } {
  const score = Math.round(
    40 * Math.min(1, comparablesCount / 15) +
      40 * Math.min(1, soldCount / 10) +
      (curveFromData ? 20 : 0),
  );
  const label: Confidence = score >= 70 ? "élevée" : score >= 40 ? "moyenne" : "faible";
  return { score, label };
}

/**
 * Délai estimé pour vendre à un prix donné, lu sur la courbe prix / délai
 * (prolongée en ligne droite au-delà des horizons calculés).
 */
export function daysForPriceFromResult(result: EstimationResult, price: number): number | null {
  const first = result.horizons[0];
  const last = result.horizons[result.horizons.length - 1];
  if (!first || !last || last.price === first.price) return null;
  const days = first.days + ((price - first.price) * (last.days - first.days)) / (last.price - first.price);
  return Math.max(1, Math.round(days));
}
