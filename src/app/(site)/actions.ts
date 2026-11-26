"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const TradeInSchema = z.object({
  name: z.string().trim().min(2, "Merci d'indiquer votre nom."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z.string().trim().max(30).optional(),
  car: z.string().trim().min(3, "Indiquez votre voiture (modèle et année).").max(200),
  mileage: z.string().trim().max(20).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type TradeInState = { ok: boolean; error?: string } | null;

/** Demande de reprise d'un véhicule, envoyée depuis la page d'accueil. */
export async function createTradeInLead(_prev: TradeInState, formData: FormData): Promise<TradeInState> {
  const parsed = TradeInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const d = parsed.data;
  const details = [`Voiture : ${d.car}`, d.mileage ? `Kilométrage : ${d.mileage} km` : null, d.message || null]
    .filter(Boolean)
    .join("\n");

  await db.lead.create({
    data: { type: "REPRISE", name: d.name, email: d.email, phone: d.phone || null, message: details },
  });
  return { ok: true };
}
