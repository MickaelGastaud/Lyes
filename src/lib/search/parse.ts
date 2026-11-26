import { CATALOG, type BodyType } from "@/lib/catalog";
import type { Fuel, Gearbox } from "@/lib/estimation/types";

/**
 * Recherche en langage libre : transforme une phrase ("SUV hybride familial moins de 35 000 €")
 * en critères structurés. Version à base de règles, sans service externe.
 * Prévu ensuite : brancher un modèle d'IA pour comprendre des phrases plus libres.
 */
export interface SearchCriteria {
  makes: string[];
  models: { make: string; model: string }[];
  bodyTypes: BodyType[];
  fuels: Fuel[];
  gearbox?: Gearbox;
  maxPrice?: number;
  minPrice?: number;
  maxMileage?: number;
  minYear?: number;
  minSeats?: number;
}

export interface ParsedQuery {
  criteria: SearchCriteria;
  /** Ce que le moteur a compris, affiché au client sous forme d'étiquettes. */
  understood: string[];
}

/** Minuscules, sans accents, espaces normalisés. */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** "35 000", "35.000", "35k", "35000" → 35000 */
function parseAmount(raw: string): number {
  const k = /k$/i.test(raw.trim());
  const n = Number(raw.replace(/k$/i, "").replace(/[\s.]/g, ""));
  return k ? n * 1000 : n;
}

const fmt = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");

const MAKE_ALIASES: Record<string, string> = {
  vw: "Volkswagen",
  mercedes: "Mercedes-Benz",
  merco: "Mercedes-Benz",
};

const BODY_WORDS: [RegExp, BodyType][] = [
  [/\b(suv|4x4|crossover)\b/, "SUV"],
  [/\bberlines?\b/, "berline"],
  [/\bbreaks?\b/, "break"],
  [/\b(citadines?|petite voiture|pour la ville)\b/, "citadine"],
  [/\bcompactes?\b/, "compacte"],
  [/\bmonospaces?\b/, "monospace"],
  [/\bcoupes?\b/, "coupé"],
  [/\b(cabriolets?|decapotables?)\b/, "cabriolet"],
];

const FUEL_WORDS: [RegExp, Fuel, string][] = [
  [/\bhybrides?\b/, "hybride", "Hybride"],
  [/\b(electriques?|ev|100 ?% electrique)\b/, "electrique", "Électrique"],
  [/\bdiesel\b/, "diesel", "Diesel"],
  [/\bessence\b/, "essence", "Essence"],
];

const AMOUNT = String.raw`(\d{1,3}(?:[ .]\d{3})+|\d+ ?k|\d+)`;

export function parseQuery(query: string, now: Date = new Date()): ParsedQuery {
  const q = normalize(query);
  const c: SearchCriteria = { makes: [], models: [], bodyTypes: [], fuels: [] };
  const understood: string[] = [];

  // Kilométrage maximum
  const km = q.match(new RegExp(String.raw`(?:moins de|max(?:imum)?|sous|<|pas plus de)\s*${AMOUNT}\s*(?:km|kms|kilometres?)\b`));
  if (km) {
    c.maxMileage = parseAmount(km[1]);
  } else if (/\b(peu de (km|kilometres)|faible kilometrage|peu roule)/.test(q)) {
    c.maxMileage = 50_000;
  }
  if (c.maxMileage) understood.push(`≤ ${fmt(c.maxMileage)} km`);
  const withoutKm = q.replace(new RegExp(String.raw`${AMOUNT}\s*(?:km|kms|kilometres?)\b`, "g"), " ");

  // Budget
  const between = withoutKm.match(new RegExp(String.raw`entre\s*${AMOUNT}\s*(?:€|euros?)?\s*et\s*${AMOUNT}`));
  if (between) {
    c.minPrice = parseAmount(between[1]);
    c.maxPrice = parseAmount(between[2]);
    understood.push(`${fmt(c.minPrice)} à ${fmt(c.maxPrice)} €`);
  } else {
    const max =
      withoutKm.match(new RegExp(String.raw`(?:moins de|max(?:imum)?|sous|jusqu'?a|budget(?: de)?|<|pas plus de)\s*${AMOUNT}\s*(?:€|euros?|eur)?`)) ??
      withoutKm.match(new RegExp(String.raw`${AMOUNT}\s*(?:€|euros?|eur)\b`));
    if (max) {
      const v = parseAmount(max[1]);
      if (v >= 1000) {
        c.maxPrice = v;
        understood.push(`≤ ${fmt(v)} €`);
      }
    }
  }

  // Année
  const after = q.match(/\b(apres|depuis|a partir de|plus recente? que|minimum)\s*((?:19|20)\d{2})\b/);
  if (after) {
    const y = Number(after[2]);
    c.minYear = after[1] === "apres" ? y + 1 : y;
  } else if (/\brecentes?\b/.test(q)) {
    c.minYear = now.getFullYear() - 3;
  }
  if (c.minYear) understood.push(`Depuis ${c.minYear}`);

  // Énergie, boîte, carrosserie
  for (const [re, fuel, label] of FUEL_WORDS) {
    if (re.test(q)) {
      c.fuels.push(fuel);
      understood.push(label);
    }
  }
  if (/\b(automatiques?|bva|boite auto)\b/.test(q)) {
    c.gearbox = "automatique";
    understood.push("Automatique");
  } else if (/\b(manuelles?|bvm)\b/.test(q)) {
    c.gearbox = "manuelle";
    understood.push("Manuelle");
  }
  for (const [re, body] of BODY_WORDS) {
    if (re.test(q) && !c.bodyTypes.includes(body)) {
      c.bodyTypes.push(body);
      understood.push(body === "SUV" ? "SUV" : body[0].toUpperCase() + body.slice(1));
    }
  }

  // Places et usage familial
  const seats = q.match(/\b([5-9]) places\b/);
  if (seats) {
    c.minSeats = Number(seats[1]);
    understood.push(`${c.minSeats} places`);
  }
  if (/\b(familiale?s?|famille|enfants)\b/.test(q) && c.bodyTypes.length === 0) {
    c.bodyTypes.push("SUV", "break", "monospace");
    understood.push("Familiale");
  }

  // Marques et modèles
  const words = ` ${q} `;
  for (const m of CATALOG) {
    if (words.includes(` ${normalize(m.model)} `) && !c.models.some((x) => x.model === m.model)) {
      c.models.push({ make: m.make, model: m.model });
      understood.push(`${m.make} ${m.model}`);
    }
  }
  const makeNames = new Set(CATALOG.map((m) => m.make));
  for (const make of makeNames) {
    const n = normalize(make);
    const aliasHit = Object.entries(MAKE_ALIASES).some(([alias, target]) => target === make && words.includes(` ${alias} `));
    if ((words.includes(` ${n} `) || aliasHit) && !c.models.some((m) => m.make === make)) {
      c.makes.push(make);
      understood.push(make);
    }
  }

  return { criteria: c, understood };
}
