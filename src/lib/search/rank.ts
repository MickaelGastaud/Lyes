import type { SearchCriteria } from "./parse";

export interface Searchable {
  make: string;
  model: string;
  bodyType: string;
  fuel: string;
  gearbox: string;
  year: number;
  mileage: number;
  seats: number;
  listPrice: number | null;
}

/** Liste des tests à passer pour une voiture, un par critère saisi. */
function checks(v: Searchable, c: SearchCriteria): boolean[] {
  const out: boolean[] = [];
  if (c.models.length || c.makes.length) {
    out.push(
      c.models.some((m) => m.make === v.make && m.model === v.model) || c.makes.includes(v.make),
    );
  }
  if (c.bodyTypes.length) out.push(c.bodyTypes.includes(v.bodyType as never));
  if (c.fuels.length) out.push(c.fuels.includes(v.fuel as never));
  if (c.gearbox) out.push(v.gearbox === c.gearbox);
  if (c.maxPrice) out.push(v.listPrice !== null && v.listPrice <= c.maxPrice);
  if (c.minPrice) out.push(v.listPrice !== null && v.listPrice >= c.minPrice);
  if (c.maxMileage) out.push(v.mileage <= c.maxMileage);
  if (c.minYear) out.push(v.year >= c.minYear);
  if (c.minSeats) out.push(v.seats >= c.minSeats);
  return out;
}

/**
 * Classe le stock : d'abord les voitures qui cochent tous les critères,
 * puis, s'il n'y en a pas, les plus proches (comme un vendeur qui propose une alternative).
 */
export function rankVehicles<T extends Searchable>(
  vehicles: T[],
  criteria: SearchCriteria,
): { exact: T[]; close: T[] } {
  const scored = vehicles.map((v) => {
    const r = checks(v, criteria);
    return { v, ok: r.filter(Boolean).length, total: r.length };
  });
  const exact = scored.filter((s) => s.ok === s.total).map((s) => s.v);
  const close =
    exact.length > 0
      ? []
      : scored
          .filter((s) => s.ok > 0)
          .sort((a, b) => b.ok - a.ok)
          .slice(0, 6)
          .map((s) => s.v);
  return { exact, close };
}
