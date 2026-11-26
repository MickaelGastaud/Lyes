"use server";

import { redirect } from "next/navigation";
import { findModel } from "@/lib/catalog";
import { db } from "@/lib/db";
import { readEstimationParams, runEstimation, toCosts, toSpec } from "@/lib/estimation/run";

/** Enregistre l'estimation et crée la voiture dans le stock au statut "Estimée". */
export async function saveEstimation(formData: FormData) {
  const params = readEstimationParams(Object.fromEntries(formData) as Record<string, string>);
  const spec = toSpec(params);
  const costs = toCosts(params);
  if (!spec) throw new Error("Estimation incomplète.");
  const catalog = findModel(spec.make, spec.model);
  const result = await runEstimation(spec, costs);
  if (!result || !catalog) throw new Error("Aucune donnée de marché pour ce modèle.");

  const vehicle = await db.vehicle.create({
    data: {
      status: "ESTIMATED",
      plate: params.plate ?? null,
      make: spec.make,
      model: spec.model,
      trim: params.trim ?? null,
      bodyType: catalog.bodyType,
      year: spec.year,
      mileage: spec.mileage,
      fuel: spec.fuel ?? catalog.fuels[0],
      gearbox: spec.gearbox ?? catalog.gearboxes[0],
      powerHp: catalog.powerHp,
      seats: catalog.seats,
      purchaseCountry: params.country,
      purchasePrice: costs?.purchasePrice ?? null,
      importCosts: costs?.importCosts ?? 0,
      reconditioningCosts: params.reconditioning,
      listPrice: result.bestHorizon?.price ?? result.horizons[1]?.price ?? result.referencePrice,
      estimations: {
        create: {
          input: JSON.stringify(params),
          // On garde le résultat sans le détail complet des annonces, pour rester léger.
          result: JSON.stringify({
            ...result,
            comparables: result.comparables.slice(0, 20).map((c) => ({
              id: c.listing.id,
              adjustedPrice: Math.round(c.adjustedPrice),
              daysOnline: c.daysOnline,
              sold: c.sold,
            })),
          }),
        },
      },
    },
  });

  redirect(`/admin/stock/${vehicle.id}`);
}
