import type { Fuel, Gearbox } from "@/lib/estimation/types";

export type BodyType =
  | "citadine"
  | "compacte"
  | "berline"
  | "break"
  | "SUV"
  | "monospace"
  | "coupé"
  | "cabriolet";

export const BODY_TYPES: BodyType[] = [
  "citadine", "compacte", "berline", "break", "SUV", "monospace", "coupé", "cabriolet",
];

export const FUELS: { value: Fuel; label: string }[] = [
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "hybride", label: "Hybride" },
  { value: "electrique", label: "Électrique" },
];

export const GEARBOXES: { value: Gearbox; label: string }[] = [
  { value: "manuelle", label: "Manuelle" },
  { value: "automatique", label: "Automatique" },
];

/** Modèles connus de l'application (démo). À remplacer par le référentiel du fournisseur de données. */
export interface CatalogModel {
  make: string;
  model: string;
  bodyType: BodyType;
  newPrice: number; // prix neuf indicatif, utilisé pour générer les données de démo
  fuels: Fuel[];
  gearboxes: Gearbox[];
  seats: number;
  powerHp: number;
}

export const CATALOG: CatalogModel[] = [
  { make: "Renault", model: "Clio", bodyType: "citadine", newPrice: 21_000, fuels: ["essence", "hybride"], gearboxes: ["manuelle", "automatique"], seats: 5, powerHp: 100 },
  { make: "Peugeot", model: "308", bodyType: "compacte", newPrice: 31_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["manuelle", "automatique"], seats: 5, powerHp: 130 },
  { make: "Peugeot", model: "3008", bodyType: "SUV", newPrice: 38_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 136 },
  { make: "Peugeot", model: "5008", bodyType: "SUV", newPrice: 42_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["automatique"], seats: 7, powerHp: 136 },
  { make: "Renault", model: "Austral", bodyType: "SUV", newPrice: 37_000, fuels: ["hybride", "essence"], gearboxes: ["automatique"], seats: 5, powerHp: 160 },
  { make: "Volkswagen", model: "Golf", bodyType: "compacte", newPrice: 32_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["manuelle", "automatique"], seats: 5, powerHp: 130 },
  { make: "Volkswagen", model: "Tiguan", bodyType: "SUV", newPrice: 43_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 150 },
  { make: "Skoda", model: "Octavia", bodyType: "break", newPrice: 33_000, fuels: ["essence", "diesel"], gearboxes: ["manuelle", "automatique"], seats: 5, powerHp: 150 },
  { make: "Audi", model: "A3", bodyType: "compacte", newPrice: 37_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 150 },
  { make: "Audi", model: "Q5", bodyType: "SUV", newPrice: 60_000, fuels: ["diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 204 },
  { make: "BMW", model: "Série 3", bodyType: "berline", newPrice: 49_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 184 },
  { make: "BMW", model: "X3", bodyType: "SUV", newPrice: 60_000, fuels: ["diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 190 },
  { make: "Mercedes-Benz", model: "Classe A", bodyType: "compacte", newPrice: 39_000, fuels: ["essence", "diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 136 },
  { make: "Mercedes-Benz", model: "GLC", bodyType: "SUV", newPrice: 64_000, fuels: ["diesel", "hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 204 },
  { make: "Tesla", model: "Model 3", bodyType: "berline", newPrice: 45_000, fuels: ["electrique"], gearboxes: ["automatique"], seats: 5, powerHp: 283 },
  { make: "Toyota", model: "RAV4", bodyType: "SUV", newPrice: 43_000, fuels: ["hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 218 },
  { make: "Volvo", model: "XC60", bodyType: "SUV", newPrice: 57_000, fuels: ["hybride"], gearboxes: ["automatique"], seats: 5, powerHp: 250 },
];

export const MAKES = [...new Set(CATALOG.map((m) => m.make))].sort();

export function findModel(make: string, model: string): CatalogModel | undefined {
  const n = (s: string) => s.trim().toLowerCase();
  return CATALOG.find((m) => n(m.make) === n(make) && n(m.model) === n(model));
}
