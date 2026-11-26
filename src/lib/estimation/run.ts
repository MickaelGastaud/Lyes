import "server-only";
import { DEFAULT_COSTS } from "@/lib/config";
import { db } from "@/lib/db";
import { estimate } from "./estimate";
import { defaultImportCosts } from "./margin";
import type { CostInputs, Fuel, Gearbox, PurchaseCountry, VehicleSpec } from "./types";

const FUELS: Fuel[] = ["essence", "diesel", "hybride", "electrique"];
const GEARBOXES: Gearbox[] = ["manuelle", "automatique"];
const COUNTRIES: PurchaseCountry[] = ["FR", "DE", "BE", "ES", "IT", "AUTRE"];

/** Paramètres du formulaire d'estimation (tous facultatifs tant que le formulaire est incomplet). */
export interface EstimationParams {
  plate?: string;
  make?: string;
  model?: string;
  trim?: string;
  year?: number;
  mileage?: number;
  fuel?: Fuel;
  gearbox?: Gearbox;
  purchasePrice?: number;
  country: PurchaseCountry;
  reconditioning: number;
  importCosts?: number;
  warrantyCost: number;
  holdingCostPerDay: number;
}

const int = (v: string | undefined) => {
  if (v === undefined || v.trim() === "") return undefined;
  const n = Number(v.replace(/[\s€]/g, ""));
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
};
const oneOf = <T extends string>(v: string | undefined, list: T[]) => (list.includes(v as T) ? (v as T) : undefined);

/** Lit les paramètres d'URL ou de formulaire, avec des valeurs par défaut sûres. */
export function readEstimationParams(sp: Record<string, string | undefined>): EstimationParams {
  const [make, model] = (sp.vehicle ?? "").split("|");
  return {
    plate: sp.plate?.trim() || undefined,
    make: make || undefined,
    model: model || undefined,
    trim: sp.trim?.trim() || undefined,
    year: int(sp.year),
    mileage: int(sp.mileage),
    fuel: oneOf(sp.fuel, FUELS),
    gearbox: oneOf(sp.gearbox, GEARBOXES),
    purchasePrice: int(sp.purchasePrice),
    country: oneOf(sp.country, COUNTRIES) ?? "FR",
    reconditioning: int(sp.reconditioning) ?? DEFAULT_COSTS.reconditioning,
    importCosts: int(sp.importCosts),
    warrantyCost: int(sp.warrantyCost) ?? DEFAULT_COSTS.warrantyCost,
    holdingCostPerDay: int(sp.holdingCostPerDay) ?? DEFAULT_COSTS.holdingCostPerDay,
  };
}

export function toSpec(p: EstimationParams): VehicleSpec | null {
  if (!p.make || !p.model || !p.year || p.mileage === undefined) return null;
  return { make: p.make, model: p.model, year: p.year, mileage: p.mileage, fuel: p.fuel, gearbox: p.gearbox };
}

export function toCosts(p: EstimationParams): CostInputs | null {
  if (p.purchasePrice === undefined) return null;
  return {
    purchasePrice: p.purchasePrice,
    purchaseCountry: p.country,
    reconditioning: p.reconditioning,
    importCosts: p.importCosts ?? defaultImportCosts(p.country),
    warrantyCost: p.warrantyCost,
    holdingCostPerDay: p.holdingCostPerDay,
    otherCosts: 0,
  };
}

/** Lance l'estimation sur les annonces du marché enregistrées en base. */
export async function runEstimation(spec: VehicleSpec, costs: CostInputs | null) {
  const listings = await db.marketListing.findMany({ where: { make: spec.make, model: spec.model } });
  return estimate(spec, listings, costs);
}
