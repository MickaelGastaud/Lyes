"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const LeadSchema = z.object({
  vehicleId: z.string().min(1),
  type: z.enum(["ESSAI", "RESERVATION", "QUESTION"]),
  name: z.string().trim().min(2, "Merci d'indiquer votre nom."),
  email: z.string().trim().email("Adresse e-mail invalide."),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
});

export type LeadState = { ok: boolean; error?: string } | null;

/** Enregistre une demande client (essai, réservation ou question) depuis une fiche véhicule. */
export async function createLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  const parsed = LeadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const vehicle = await db.vehicle.findFirst({ where: { id: parsed.data.vehicleId, published: true } });
  if (!vehicle) return { ok: false, error: "Cette voiture n'est plus disponible." };

  await db.lead.create({ data: { ...parsed.data, phone: parsed.data.phone || null, message: parsed.data.message || null } });
  return { ok: true };
}
