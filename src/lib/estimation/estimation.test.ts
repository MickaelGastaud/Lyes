import { describe, expect, it } from "vitest";
import { selectComparables } from "./comparables";
import { estimate } from "./estimate";
import { computeMargin, defaultImportCosts } from "./margin";
import { defaultCurve, fitDelayCurve, ratioForDays, weightedMedian } from "./pricing";
import type { CostInputs, Listing } from "./types";

const NOW = new Date("2026-11-01T00:00:00Z");
const DAY = 86_400_000;

/** Fabrique une annonce de Golf 2021, 50 000 km, vendue en `days` jours au prix `price`. */
function listing(price: number, days: number, overrides: Partial<Listing> = {}): Listing {
  const firstSeenAt = new Date(NOW.getTime() - 200 * DAY);
  return {
    id: Math.random().toString(36).slice(2),
    make: "Volkswagen",
    model: "Golf",
    year: 2021,
    mileage: 50_000,
    fuel: "essence",
    gearbox: "manuelle",
    listedPrice: price,
    firstSeenAt,
    removedAt: new Date(firstSeenAt.getTime() + days * DAY),
    ...overrides,
  };
}

const costs: CostInputs = {
  purchasePrice: 15_000,
  purchaseCountry: "FR",
  reconditioning: 800,
  importCosts: 0,
  warrantyCost: 350,
  holdingCostPerDay: 15,
  otherCosts: 0,
};

describe("weightedMedian", () => {
  it("renvoie la valeur du milieu en tenant compte des poids", () => {
    expect(weightedMedian([{ value: 1, weight: 1 }, { value: 2, weight: 1 }, { value: 3, weight: 1 }])).toBe(2);
    expect(weightedMedian([{ value: 1, weight: 1 }, { value: 10, weight: 5 }])).toBe(10);
    expect(weightedMedian([])).toBeNull();
  });
});

describe("courbe prix / délai", () => {
  it("le modèle par défaut vend 3 % sous le marché en 30 j et 3 % au-dessus en 90 j", () => {
    const curve = defaultCurve();
    expect(ratioForDays(curve, 30)).toBeCloseTo(0.97, 5);
    expect(ratioForDays(curve, 90)).toBeCloseTo(1.03, 5);
  });

  it("apprend la pente à partir de ventes réelles", () => {
    // Données parfaites : délai = 30 + 500 × (ratio − 0,95)
    const ref = 20_000;
    const comps = [0.93, 0.95, 0.97, 0.99, 1.01, 1.03, 1.05].map((r) => ({
      listing: listing(ref * r, 30 + 500 * (r - 0.95)),
      adjustedPrice: ref * r,
      weight: 1,
      daysOnline: 30 + 500 * (r - 0.95),
      sold: true,
    }));
    const curve = fitDelayCurve(comps, ref);
    expect(curve.source).toBe("données");
    expect(curve.b).toBeCloseTo(500, 0);
    expect(ratioForDays(curve, 30)).toBeCloseTo(0.95, 3);
  });

  it("revient au modèle par défaut s'il y a trop peu de ventes", () => {
    const comps = [listing(20_000, 30)].map((l) => ({
      listing: l, adjustedPrice: 20_000, weight: 1, daysOnline: 30, sold: true,
    }));
    expect(fitDelayCurve(comps, 20_000).source).toBe("modèle par défaut");
  });
});

describe("comparables", () => {
  it("écarte les autres modèles et les voitures trop éloignées", () => {
    const listings = [
      listing(20_000, 30),
      listing(20_000, 30, { model: "Polo" }),
      listing(20_000, 30, { year: 2016 }),
      listing(20_000, 30, { mileage: 150_000 }),
    ];
    const comps = selectComparables({ make: "volkswagen", model: "GOLF", year: 2021, mileage: 50_000 }, listings, NOW);
    expect(comps).toHaveLength(1);
  });

  it("ajuste le prix d'une voiture plus ancienne vers le haut", () => {
    const [c] = selectComparables(
      { make: "Volkswagen", model: "Golf", year: 2022, mileage: 50_000 },
      [listing(20_000, 30)],
      NOW,
    );
    expect(c.adjustedPrice).toBeCloseTo(22_000, 0);
  });
});

describe("marge", () => {
  it("calcule la marge nette avec TVA sur marge et coût de stock", () => {
    const m = computeMargin(20_000, 30, costs);
    expect(m.holdingCost).toBe(450);
    expect(m.vatOnMargin).toBe(833); // 5 000 € × 20/120
    expect(m.netMargin).toBe(20_000 - 15_000 - 800 - 350 - 450 - 833);
  });

  it("ajoute des frais d'import hors de France", () => {
    expect(defaultImportCosts("FR")).toBe(0);
    expect(defaultImportCosts("DE")).toBeGreaterThan(0);
  });
});

describe("estimate", () => {
  it("renvoie null sans comparable", () => {
    expect(estimate({ make: "Lada", model: "Niva", year: 2020, mileage: 10_000 }, [], costs, { now: NOW })).toBeNull();
  });

  it("propose un prix croissant avec le délai et choisit le meilleur horizon", () => {
    const listings = Array.from({ length: 20 }, (_, i) => {
      const r = 0.92 + i * 0.008;
      return listing(Math.round(20_000 * r), Math.round(30 + 800 * (r - 0.97)));
    });
    const result = estimate({ make: "Volkswagen", model: "Golf", year: 2021, mileage: 50_000 }, listings, costs, { now: NOW })!;

    expect(result.comparablesCount).toBe(20);
    expect(result.curveSource).toBe("données");
    const prices = result.horizons.map((h) => h.price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    expect(result.horizons.every((h) => h.low <= h.price && h.price <= h.high)).toBe(true);
    expect(result.bestHorizon).not.toBeNull();
    expect(result.confidence).toBe("élevée");
  });
});
