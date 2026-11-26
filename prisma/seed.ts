/**
 * Données de démonstration (fictives) :
 * - ~1 500 annonces du marché français, qui servent de comparables à l'estimation ;
 * - une dizaine de voitures dans le stock, à différents stades.
 *
 * Lancer : npm run db:seed   (efface et recrée les données)
 */
import { PrismaClient } from "@prisma/client";
import { CATALOG, findModel } from "../src/lib/catalog";
import { CHECKPOINTS } from "../src/lib/config";

const db = new PrismaClient();
const DAY = 86_400_000;
const NOW = Date.now();
const CURRENT_YEAR = new Date().getFullYear();

/** Générateur pseudo-aléatoire déterministe : mêmes données à chaque lancement. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(42);
const between = (min: number, max: number) => min + rand() * (max - min);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const gauss = () => (rand() + rand() + rand() + rand() - 2) * 1.7;

const FUEL_FACTOR: Record<string, number> = { essence: 1, diesel: 0.96, hybride: 1.06, electrique: 0.95 };
const REGIONS = ["Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur", "Occitanie", "Nouvelle-Aquitaine", "Hauts-de-France", "Grand Est", "Bretagne"];

/** Valeur de marché "vraie" d'une voiture (inconnue du moteur d'estimation). */
function marketValue(newPrice: number, year: number, mileage: number, fuel: string) {
  const age = CURRENT_YEAR - year;
  const expectedKm = age * 15_000;
  return newPrice * Math.pow(0.88, age) * (1 - (0.02 * (mileage - expectedKm)) / 10_000) * (FUEL_FACTOR[fuel] ?? 1);
}

function makeListings() {
  const listings = [];
  for (const m of CATALOG) {
    for (let i = 0; i < 90; i++) {
      const year = Math.round(between(CURRENT_YEAR - 8, CURRENT_YEAR - 1));
      const age = CURRENT_YEAR - year;
      const mileage = Math.max(3_000, Math.round((age * 15_000 + gauss() * 12_000) / 500) * 500);
      const fuel = pick(m.fuels);
      const value = marketValue(m.newPrice, year, mileage, fuel);
      // Le vendeur affiche plus ou moins cher que la valeur du marché…
      const ratio = between(0.93, 1.12);
      const listedPrice = Math.round((value * ratio) / 100) * 100;
      // …et plus c'est cher, plus la vente prend du temps.
      const daysToSell = Math.round(Math.min(160, Math.max(4, 40 + 420 * (ratio - 1) + gauss() * 6)));
      const firstSeenAt = new Date(NOW - between(5, 260) * DAY);
      const soldAt = firstSeenAt.getTime() + daysToSell * DAY;

      listings.push({
        source: "demo",
        make: m.make,
        model: m.model,
        bodyType: m.bodyType,
        year,
        mileage,
        fuel,
        gearbox: pick(m.gearboxes),
        region: pick(REGIONS),
        listedPrice,
        firstSeenAt,
        removedAt: soldAt < NOW ? new Date(soldAt) : null,
      });
    }
  }
  return listings;
}

interface StockSeed {
  status: string;
  plate: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  mileage: number;
  fuel: string;
  gearbox: string;
  color: string;
  description: string;
  photoUrl?: string;
  purchaseCountry?: string;
  purchasePrice: number;
  importCosts?: number;
  reconditioningCosts: number;
  listPrice?: number;
  soldPrice?: number;
  daysAgoPurchased: number;
  daysAgoListed?: number;
  daysAgoSold?: number;
  works: string[];
}

const STOCK: StockSeed[] = [
  {
    status: "FOR_SALE", plate: "GH-482-KL", photoUrl: "/images/vehicules/toyota-rav4-gh482kl.jpg", make: "Toyota", model: "RAV4", trim: "Hybride 218 ch Design", year: 2022, mileage: 41_500,
    fuel: "hybride", gearbox: "automatique", color: "Blanc nacré, toit noir",
    description: "Première main, entretien exclusif dans le réseau Toyota. Caméra de recul, sièges chauffants, régulateur adaptatif.",
    purchasePrice: 26_800, reconditioningCosts: 650, listPrice: 32_900, daysAgoPurchased: 28, daysAgoListed: 18,
    works: ["Vidange et filtres", "Plaquettes avant neuves", "Lustrage complet"],
  },
  {
    status: "FOR_SALE", plate: "FD-930-PR", photoUrl: "/images/vehicules/peugeot-3008-fd930pr.jpg", make: "Peugeot", model: "3008", trim: "Hybrid 136 Allure e-DCS6", year: 2023, mileage: 28_000,
    fuel: "hybride", gearbox: "automatique", color: "Gris Platinium",
    description: "Garantie constructeur restante, i-Cockpit, navigation connectée, hayon mains libres.",
    purchasePrice: 23_400, reconditioningCosts: 400, listPrice: 28_500, daysAgoPurchased: 20, daysAgoListed: 12,
    works: ["Révision complète", "Rénovation jantes"],
  },
  {
    status: "FOR_SALE", plate: "EZ-117-AB", make: "BMW", model: "Série 3", trim: "320d xDrive M Sport", year: 2021, mileage: 62_000,
    fuel: "diesel", gearbox: "automatique", color: "Noir Saphir",
    description: "Importée d'Allemagne, pack M Sport, toit ouvrant, Harman Kardon. Historique d'entretien complet.",
    purchaseCountry: "DE", purchasePrice: 24_900, importCosts: 1_450, reconditioningCosts: 900, listPrice: 31_900,
    daysAgoPurchased: 40, daysAgoListed: 25, works: ["Distribution contrôlée", "Pneus Michelin neufs (x4)", "Retouches carrosserie"],
  },
  {
    status: "FOR_SALE", plate: "GA-205-TS", photoUrl: "/images/vehicules/tesla-model-3-ga205ts.jpg", make: "Tesla", model: "Model 3", trim: "Propulsion", year: 2022, mileage: 48_000,
    fuel: "electrique", gearbox: "automatique", color: "Blanc nacré",
    description: "Batterie contrôlée (état de santé 93 %), Autopilot, mise à jour logicielle récente.",
    purchasePrice: 23_200, reconditioningCosts: 300, listPrice: 28_900, daysAgoPurchased: 15, daysAgoListed: 9,
    works: ["Test de santé de la batterie", "Filtre d'habitacle neuf"],
  },
  {
    status: "FOR_SALE", plate: "FL-664-MV", make: "Volvo", model: "XC60", trim: "T6 Recharge Inscription", year: 2021, mileage: 69_000,
    fuel: "hybride", gearbox: "automatique", color: "Gris Thunder",
    description: "Hybride rechargeable, intérieur cuir, affichage tête haute, pack hiver.",
    purchasePrice: 30_500, reconditioningCosts: 1_100, listPrice: 37_400, daysAgoPurchased: 35, daysAgoListed: 22,
    works: ["Révision complète", "Disques et plaquettes arrière", "Nettoyage intérieur cuir"],
  },
  {
    status: "FOR_SALE", plate: "FS-318-QC", make: "Volkswagen", model: "Golf", trim: "1.5 eTSI 150 Style DSG7", year: 2022, mileage: 36_000,
    fuel: "hybride", gearbox: "automatique", color: "Rouge Kings",
    description: "Micro-hybride, Digital Cockpit Pro, aide au stationnement avant et arrière.",
    purchasePrice: 19_900, reconditioningCosts: 450, listPrice: 24_300, daysAgoPurchased: 12, daysAgoListed: 6,
    works: ["Vidange", "Lustrage"],
  },
  {
    status: "FOR_SALE", plate: "EW-554-JD", photoUrl: "/images/vehicules/skoda-octavia-ew554jd.jpg", make: "Skoda", model: "Octavia", trim: "Combi 2.0 TDI 150 Style", year: 2021, mileage: 74_000,
    fuel: "diesel", gearbox: "automatique", color: "Gris Quartz",
    description: "Break familial, coffre de 640 L, attelage, régulateur adaptatif.",
    purchasePrice: 16_400, reconditioningCosts: 700, listPrice: 20_900, daysAgoPurchased: 30, daysAgoListed: 20,
    works: ["Révision", "Pneus avant neufs"],
  },
  {
    status: "RECONDITIONING", plate: "GB-771-NX", make: "Audi", model: "Q5", trim: "40 TDI quattro S line", year: 2022, mileage: 52_000,
    fuel: "diesel", gearbox: "automatique", color: "Bleu Navarre",
    description: "En préparation : passage au contrôle technique prévu.",
    purchaseCountry: "DE", purchasePrice: 33_800, importCosts: 1_450, reconditioningCosts: 600, daysAgoPurchased: 6,
    works: ["Révision en cours"],
  },
  {
    status: "SOLD", plate: "FK-209-HB", make: "Peugeot", model: "5008", trim: "BlueHDi 130 GT EAT8", year: 2021, mileage: 58_000,
    fuel: "diesel", gearbox: "automatique", color: "Gris Artense",
    description: "7 places, toit panoramique.", purchasePrice: 21_000, reconditioningCosts: 800, listPrice: 25_900, soldPrice: 25_400,
    daysAgoPurchased: 70, daysAgoListed: 60, daysAgoSold: 24, works: ["Révision", "Pneus x4"],
  },
  {
    status: "SOLD", plate: "FE-845-RT", make: "Mercedes-Benz", model: "Classe A", trim: "A 200 Progressive Line", year: 2021, mileage: 39_000,
    fuel: "essence", gearbox: "automatique", color: "Blanc Polaire",
    description: "Écran MBUX, caméra de recul.", purchasePrice: 20_300, reconditioningCosts: 500, listPrice: 24_900, soldPrice: 24_500,
    daysAgoPurchased: 95, daysAgoListed: 85, daysAgoSold: 47, works: ["Révision"],
  },
  {
    status: "SOLD", plate: "EV-390-LM", make: "Renault", model: "Clio", trim: "E-Tech 145 Intens", year: 2022, mileage: 25_000,
    fuel: "hybride", gearbox: "automatique", color: "Orange Valencia",
    description: "Citadine hybride, faible consommation.", purchasePrice: 13_600, reconditioningCosts: 300, listPrice: 17_200, soldPrice: 16_900,
    daysAgoPurchased: 60, daysAgoListed: 55, daysAgoSold: 33, works: ["Vidange"],
  },
];

async function main() {
  await db.lead.deleteMany();
  await db.estimation.deleteMany();
  await db.vehicle.deleteMany();
  await db.marketListing.deleteMany();

  const listings = makeListings();
  await db.marketListing.createMany({ data: listings });

  for (const s of STOCK) {
    const catalog = findModel(s.make, s.model)!;
    const ago = (d?: number) => (d === undefined ? null : new Date(NOW - d * DAY));
    const allChecks = s.status === "FOR_SALE" || s.status === "SOLD";
    await db.vehicle.create({
      data: {
        status: s.status,
        plate: s.plate,
        make: s.make,
        model: s.model,
        trim: s.trim,
        bodyType: catalog.bodyType,
        year: s.year,
        mileage: s.mileage,
        fuel: s.fuel,
        gearbox: s.gearbox,
        color: s.color,
        powerHp: catalog.powerHp,
        seats: catalog.seats,
        description: s.description,
        photoUrl: s.photoUrl ?? null,
        purchaseCountry: s.purchaseCountry ?? "FR",
        purchasePrice: s.purchasePrice,
        importCosts: s.importCosts ?? 0,
        reconditioningCosts: s.reconditioningCosts,
        listPrice: s.listPrice ?? null,
        soldPrice: s.soldPrice ?? null,
        published: s.status === "FOR_SALE",
        warrantyMonths: 12,
        checkpoints: JSON.stringify(allChecks ? CHECKPOINTS : CHECKPOINTS.slice(0, 4)),
        works: JSON.stringify(s.works),
        purchasedAt: ago(s.daysAgoPurchased),
        listedAt: ago(s.daysAgoListed),
        soldAt: ago(s.daysAgoSold),
      },
    });
  }

  console.log(`✔ ${listings.length} annonces de marché et ${STOCK.length} voitures en stock créées.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
