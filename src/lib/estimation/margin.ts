import { DEFAULT_COSTS } from "@/lib/config";
import type { CostInputs, MarginBreakdown, PurchaseCountry } from "./types";

/** Frais d'import par défaut : nuls pour un achat en France. */
export function defaultImportCosts(country: PurchaseCountry): number {
  if (country === "FR") return 0;
  const { transport, coc, registration } = DEFAULT_COSTS.import;
  return transport + coc + registration;
}

/**
 * Marge nette d'une vente au prix `salePrice` après `days` jours de stock.
 *
 * Hypothèse : régime de la TVA sur marge (véhicule d'occasion acheté à un particulier
 * ou sous ce régime). La TVA ne porte alors que sur (prix de vente − prix d'achat).
 */
export function computeMargin(
  salePrice: number,
  days: number,
  costs: CostInputs,
  vatRate: number = DEFAULT_COSTS.vatRate,
): MarginBreakdown {
  const holdingCost = Math.round(costs.holdingCostPerDay * days);
  const grossOnPurchase = salePrice - costs.purchasePrice;
  const vatOnMargin = Math.round(Math.max(0, grossOnPurchase) * (vatRate / (1 + vatRate)));

  const netMargin =
    salePrice -
    costs.purchasePrice -
    costs.reconditioning -
    costs.importCosts -
    costs.warrantyCost -
    holdingCost -
    costs.otherCosts -
    vatOnMargin;

  return {
    salePrice,
    purchasePrice: costs.purchasePrice,
    reconditioning: costs.reconditioning,
    importCosts: costs.importCosts,
    warrantyCost: costs.warrantyCost,
    holdingCost,
    otherCosts: costs.otherCosts,
    vatOnMargin,
    netMargin: Math.round(netMargin),
  };
}
