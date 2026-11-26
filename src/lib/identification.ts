import type { Fuel, Gearbox } from "@/lib/estimation/types";

/**
 * Identification d'une voiture à partir de sa plaque ou de son VIN.
 * L'interface est prête ; seul un fournisseur de démonstration est branché pour l'instant.
 * À remplacer par une API d'immatriculation (voir cahier des charges, section 10).
 */
export interface IdentifiedVehicle {
  make: string;
  model: string;
  trim?: string;
  year: number;
  fuel: Fuel;
  gearbox: Gearbox;
  powerHp?: number;
}

export interface VehicleIdentifier {
  identify(plateOrVin: string): Promise<IdentifiedVehicle | null>;
}

const DEMO_PLATES: Record<string, IdentifiedVehicle> = {
  "AB123CD": { make: "Peugeot", model: "3008", trim: "Allure Hybrid 136", year: 2022, fuel: "hybride", gearbox: "automatique", powerHp: 136 },
  "EF456GH": { make: "BMW", model: "Série 3", trim: "320d M Sport", year: 2021, fuel: "diesel", gearbox: "automatique", powerHp: 190 },
  "IJ789KL": { make: "Volkswagen", model: "Golf", trim: "1.5 TSI Life", year: 2020, fuel: "essence", gearbox: "manuelle", powerHp: 130 },
  "MN012OP": { make: "Toyota", model: "RAV4", trim: "Hybride 218 Design", year: 2023, fuel: "hybride", gearbox: "automatique", powerHp: 218 },
};

export const normalizePlate = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

export const demoIdentifier: VehicleIdentifier = {
  async identify(plateOrVin) {
    return DEMO_PLATES[normalizePlate(plateOrVin)] ?? null;
  },
};

export const DEMO_PLATE_LIST = ["AB-123-CD", "EF-456-GH", "IJ-789-KL", "MN-012-OP"];
