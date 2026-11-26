export type Fuel = "essence" | "diesel" | "hybride" | "electrique";
export type Gearbox = "manuelle" | "automatique";
export type PurchaseCountry = "FR" | "DE" | "BE" | "ES" | "IT" | "AUTRE";

/** Description d'une voiture à estimer. */
export interface VehicleSpec {
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel?: Fuel;
  gearbox?: Gearbox;
}

/** Annonce du marché utilisée comme comparable. */
export interface Listing {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  fuel: string;
  gearbox: string;
  region?: string | null;
  listedPrice: number;
  firstSeenAt: Date;
  removedAt: Date | null;
}

/** Comparable retenu, avec son prix ramené aux caractéristiques de la voiture estimée. */
export interface Comparable {
  listing: Listing;
  adjustedPrice: number;
  weight: number;
  daysOnline: number;
  sold: boolean;
}

/** Coûts saisis pour calculer la marge. */
export interface CostInputs {
  purchasePrice: number;
  purchaseCountry: PurchaseCountry;
  reconditioning: number;
  importCosts: number; // 0 si achat en France
  warrantyCost: number;
  holdingCostPerDay: number;
  otherCosts: number;
}

export type Confidence = "élevée" | "moyenne" | "faible";

/** Une ligne de la courbe prix / délai. */
export interface HorizonEstimate {
  days: number;
  price: number;
  low: number;
  high: number;
  margin: MarginBreakdown | null;
}

export interface MarginBreakdown {
  salePrice: number;
  purchasePrice: number;
  reconditioning: number;
  importCosts: number;
  warrantyCost: number;
  holdingCost: number;
  otherCosts: number;
  vatOnMargin: number;
  netMargin: number;
}

export interface EstimationResult {
  referencePrice: number;
  horizons: HorizonEstimate[];
  confidence: Confidence;
  confidenceScore: number;
  comparablesCount: number;
  soldCount: number;
  curveSource: "données" | "modèle par défaut";
  medianDaysToSell: number | null;
  bestHorizon: HorizonEstimate | null;
  isGoodDeal: boolean | null;
  comparables: Comparable[];
}
