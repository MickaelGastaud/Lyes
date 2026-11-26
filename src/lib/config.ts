/**
 * Réglages centraux de l'application.
 * Le nom de marque est provisoire (voir cahier des charges, section 8).
 */
export const BRAND = {
  name: "Confiauto",
  tagline: "Des voitures d'occasion contrôlées, garanties, au prix juste.",
};

/** Horizons de vente proposés par l'estimation (en jours). */
export const SALE_HORIZONS = [30, 45, 60, 90] as const;

/** Hypothèses de coûts par défaut, modifiables dans le formulaire d'estimation. */
export const DEFAULT_COSTS = {
  /** Coût de détention d'une voiture en stock, par jour (financement, parking, assurance). */
  holdingCostPerDay: 15,
  /** Coût moyen de la garantie incluse (12 mois). */
  warrantyCost: 350,
  /** Remise en état estimée par défaut. */
  reconditioning: 800,
  /** Frais d'import pour un véhicule acheté à l'étranger. */
  import: {
    transport: 900,
    coc: 200, // certificat de conformité
    registration: 350, // carte grise (varie selon la région et la puissance)
  },
  /** Marge nette minimale pour considérer l'affaire comme intéressante. */
  minNetMargin: 1500,
  /** Taux de TVA appliqué sur la marge (régime de la TVA sur marge). */
  vatRate: 0.2,
};

/** Paramètres du modèle de prix (utilisés quand les données sont insuffisantes). */
export const PRICING_MODEL = {
  /** Décote annuelle approximative, pour ajuster un comparable plus récent ou plus ancien. */
  depreciationPerYear: 0.1,
  /** Décote par tranche de 10 000 km d'écart. */
  depreciationPer10kKm: 0.025,
  /** Courbe par défaut : ratio de prix (vs prix de référence) vendu en 30 j et en 90 j. */
  defaultRatioAt30Days: 0.97,
  defaultRatioAt90Days: 1.03,
  /** Nombre minimum de ventes comparables pour apprendre la courbe depuis les données. */
  minSoldForFit: 6,
};

/** Points de contrôle réalisés sur chaque voiture avant la mise en vente. */
export const CHECKPOINTS = [
  "Historique vérifié (HistoVec)",
  "Contrôle technique de moins de 6 mois",
  "Entretien constructeur à jour",
  "Freinage (disques, plaquettes, liquide)",
  "Pneumatiques (usure, âge)",
  "Distribution et courroies",
  "Batterie et circuit de charge",
  "Diagnostic électronique sans défaut",
  "Climatisation",
  "Éclairage et signalisation",
  "Suspension et direction",
  "Carrosserie et vitrages",
  "Essai routier de 20 km",
];

/** Cycle de vie d'une voiture dans le stock. */
export const VEHICLE_STATUSES = {
  ESTIMATED: "Estimée",
  PURCHASED: "Achetée",
  RECONDITIONING: "En remise en état",
  FOR_SALE: "En vente",
  SOLD: "Vendue",
} as const;

export type VehicleStatus = keyof typeof VEHICLE_STATUSES;
