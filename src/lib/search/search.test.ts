import { describe, expect, it } from "vitest";
import { parseQuery } from "./parse";
import { rankVehicles, type Searchable } from "./rank";

const NOW = new Date("2026-11-01");

describe("parseQuery", () => {
  it("comprend une demande complète", () => {
    const { criteria: c, understood } = parseQuery("SUV hybride familial moins de 35 000 € automatique", NOW);
    expect(c.bodyTypes).toEqual(["SUV"]);
    expect(c.fuels).toEqual(["hybride"]);
    expect(c.maxPrice).toBe(35_000);
    expect(c.gearbox).toBe("automatique");
    expect(understood).toContain("≤ 35 000 €");
  });

  it("distingue le budget du kilométrage", () => {
    const { criteria: c } = parseQuery("golf moins de 60000 km budget 20k", NOW);
    expect(c.maxMileage).toBe(60_000);
    expect(c.maxPrice).toBe(20_000);
    expect(c.models).toEqual([{ make: "Volkswagen", model: "Golf" }]);
  });

  it("reconnaît marques, alias et accents", () => {
    const { criteria: c } = parseQuery("Mercedes ou BMW Série 3 électrique après 2021", NOW);
    expect(c.makes).toContain("Mercedes-Benz");
    expect(c.models).toEqual([{ make: "BMW", model: "Série 3" }]);
    expect(c.fuels).toEqual(["electrique"]);
    expect(c.minYear).toBe(2022);
  });

  it("traduit 'familiale' en carrosseries adaptées", () => {
    const { criteria: c } = parseQuery("voiture familiale 7 places", NOW);
    expect(c.bodyTypes).toEqual(["SUV", "break", "monospace"]);
    expect(c.minSeats).toBe(7);
  });
});

describe("rankVehicles", () => {
  const base: Searchable = {
    make: "Toyota", model: "RAV4", bodyType: "SUV", fuel: "hybride", gearbox: "automatique",
    year: 2022, mileage: 40_000, seats: 5, listPrice: 32_000,
  };
  const cars = [base, { ...base, model: "Clio", make: "Renault", bodyType: "citadine", listPrice: 15_000 }];

  it("garde les correspondances exactes", () => {
    const { exact } = rankVehicles(cars, parseQuery("SUV hybride moins de 35000 €").criteria);
    expect(exact).toHaveLength(1);
    expect(exact[0].model).toBe("RAV4");
  });

  it("propose des alternatives proches s'il n'y a pas de correspondance exacte", () => {
    const { exact, close } = rankVehicles(cars, parseQuery("SUV hybride moins de 20000 €").criteria);
    expect(exact).toHaveLength(0);
    expect(close[0].model).toBe("RAV4");
  });
});
