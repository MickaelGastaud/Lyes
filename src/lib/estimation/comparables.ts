import { PRICING_MODEL } from "@/lib/config";
import type { Comparable, Listing, VehicleSpec } from "./types";

const DAY_MS = 86_400_000;
const MIN_SAME_FUEL = 5;

const norm = (s: string) => s.trim().toLowerCase();
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

/**
 * Ramène le prix d'une annonce aux caractéristiques de la voiture estimée.
 * Ex. : une annonce plus ancienne d'un an vaut ~10 % de plus une fois "rajeunie".
 */
export function adjustPrice(listing: Listing, spec: VehicleSpec): number {
  const yearGap = spec.year - listing.year;
  const kmGap = spec.mileage - listing.mileage;
  const factor =
    Math.pow(1 + PRICING_MODEL.depreciationPerYear, yearGap) *
    (1 - (PRICING_MODEL.depreciationPer10kKm * kmGap) / 10_000);
  return listing.listedPrice * clamp(factor, 0.6, 1.5);
}

/** Nombre de jours pendant lesquels l'annonce est restée en ligne. */
export function daysOnline(listing: Listing, now: Date): number {
  const end = listing.removedAt ?? now;
  return Math.max(1, Math.round((end.getTime() - listing.firstSeenAt.getTime()) / DAY_MS));
}

/**
 * Sélectionne les annonces comparables : même marque et modèle,
 * année à ±2 ans, kilométrage proche. Chaque comparable reçoit un poids :
 * plus il ressemble à la voiture estimée, plus il compte.
 */
export function selectComparables(
  spec: VehicleSpec,
  listings: Listing[],
  now: Date = new Date(),
): Comparable[] {
  const kmTolerance = Math.max(30_000, spec.mileage * 0.4);

  let candidates = listings.filter(
    (l) =>
      norm(l.make) === norm(spec.make) &&
      norm(l.model) === norm(spec.model) &&
      Math.abs(l.year - spec.year) <= 2 &&
      Math.abs(l.mileage - spec.mileage) <= kmTolerance,
  );

  // Si on a assez d'annonces avec la même énergie, on ne garde qu'elles.
  if (spec.fuel) {
    const sameFuel = candidates.filter((l) => l.fuel === spec.fuel);
    if (sameFuel.length >= MIN_SAME_FUEL) candidates = sameFuel;
  }

  return candidates.map((listing) => {
    const yearGap = Math.abs(spec.year - listing.year);
    const kmGap = Math.abs(spec.mileage - listing.mileage);
    let weight = Math.exp(-yearGap / 1.5) * Math.exp(-kmGap / 30_000);
    if (spec.fuel && listing.fuel !== spec.fuel) weight *= 0.5;
    if (spec.gearbox && listing.gearbox !== spec.gearbox) weight *= 0.7;

    return {
      listing,
      adjustedPrice: adjustPrice(listing, spec),
      weight,
      daysOnline: daysOnline(listing, now),
      sold: listing.removedAt !== null,
    };
  });
}
