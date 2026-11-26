import { DEFAULT_COSTS } from "@/lib/config";
import { computeMargin } from "@/lib/estimation/margin";
import type { PurchaseCountry } from "@/lib/estimation/types";

const DAY_MS = 86_400_000;

export interface VehicleCosts {
  purchasePrice: number | null;
  purchaseCountry: string;
  importCosts: number;
  reconditioningCosts: number;
  otherCosts: number;
  purchasedAt: Date | null;
  createdAt: Date;
  soldAt: Date | null;
}

export function daysBetween(from: Date | null | undefined, to: Date | null | undefined): number | null {
  if (!from || !to) return null;
  return Math.max(0, Math.round((to.getTime() - from.getTime()) / DAY_MS));
}

/** Jours passés en stock : de l'achat jusqu'à la vente (ou jusqu'à aujourd'hui). */
export function daysInStock(v: VehicleCosts, now = new Date()): number {
  return daysBetween(v.purchasedAt ?? v.createdAt, v.soldAt ?? now) ?? 0;
}

/** Marge nette d'une voiture du stock pour un prix de vente donné. */
export function vehicleMargin(v: VehicleCosts, salePrice: number, days: number) {
  if (v.purchasePrice === null) return null;
  return computeMargin(salePrice, days, {
    purchasePrice: v.purchasePrice,
    purchaseCountry: v.purchaseCountry as PurchaseCountry,
    reconditioning: v.reconditioningCosts,
    importCosts: v.importCosts,
    warrantyCost: DEFAULT_COSTS.warrantyCost,
    holdingCostPerDay: DEFAULT_COSTS.holdingCostPerDay,
    otherCosts: v.otherCosts,
  });
}
