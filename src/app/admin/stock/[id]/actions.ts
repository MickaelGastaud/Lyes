"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CHECKPOINTS, VEHICLE_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";

/** Montant en euros : vide = non renseigné, sinon entier positif. */
const money = z.string().transform((raw, ctx) => {
  const t = raw.replace(/[\s€]/g, "");
  if (t === "") return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) {
    ctx.addIssue({ code: "custom", message: "Montant invalide" });
    return z.NEVER;
  }
  return Math.round(n);
});

const UpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(Object.keys(VEHICLE_STATUSES) as [string, ...string[]]),
  plate: z.string().trim().max(20),
  trim: z.string().trim().max(120),
  color: z.string().trim().max(60),
  mileage: z.coerce.number().int().min(0),
  description: z.string().trim().max(3000),
  purchaseCountry: z.string().max(10),
  purchasePrice: money,
  importCosts: money,
  reconditioningCosts: money,
  otherCosts: money,
  listPrice: money,
  soldPrice: money,
  warrantyMonths: z.coerce.number().int().min(0).max(120),
  works: z.string().max(3000),
});

export type UpdateState = { ok: boolean; message: string } | null;

/** Met à jour une voiture du stock. Les dates clés (achat, mise en vente, vente) se remplissent seules. */
export async function updateVehicle(_prev: UpdateState, formData: FormData): Promise<UpdateState> {
  const parsed = UpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `Champ « ${issue?.path.join(".")} » invalide.` };
  }
  const d = parsed.data;
  const current = await db.vehicle.findUnique({ where: { id: d.id } });
  if (!current) return { ok: false, message: "Voiture introuvable." };

  // Une voiture vendue est retirée du site automatiquement.
  const wantsPublished = formData.get("published") === "on" && d.status !== "SOLD";
  if (wantsPublished && (d.status !== "FOR_SALE" || !d.listPrice)) {
    return { ok: false, message: "Pour publier sur le site, la voiture doit être « En vente » avec un prix affiché." };
  }
  if (d.status === "SOLD" && !d.soldPrice) {
    return { ok: false, message: "Indiquez le prix de vente réel pour passer la voiture en « Vendue »." };
  }

  const now = new Date();
  const reached = (s: string) => Object.keys(VEHICLE_STATUSES).indexOf(d.status) >= Object.keys(VEHICLE_STATUSES).indexOf(s);
  const checkpoints = formData.getAll("checkpoints").map(String).filter((c) => CHECKPOINTS.includes(c));

  await db.vehicle.update({
    where: { id: d.id },
    data: {
      status: d.status,
      plate: d.plate || null,
      trim: d.trim || null,
      color: d.color || null,
      mileage: d.mileage,
      description: d.description || null,
      purchaseCountry: d.purchaseCountry,
      purchasePrice: d.purchasePrice,
      importCosts: d.importCosts ?? 0,
      reconditioningCosts: d.reconditioningCosts ?? 0,
      otherCosts: d.otherCosts ?? 0,
      listPrice: d.listPrice,
      soldPrice: d.soldPrice,
      warrantyMonths: d.warrantyMonths,
      published: wantsPublished,
      checkpoints: JSON.stringify(checkpoints),
      works: JSON.stringify(d.works.split("\n").map((w) => w.trim()).filter(Boolean)),
      purchasedAt: current.purchasedAt ?? (reached("PURCHASED") ? now : null),
      listedAt: current.listedAt ?? (reached("FOR_SALE") ? now : null),
      soldAt: d.status === "SOLD" ? (current.soldAt ?? now) : null,
    },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { ok: true, message: "Modifications enregistrées." };
}

export async function deleteVehicle(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const v = await db.vehicle.findUnique({ where: { id } });
  // Par sécurité, seules les voitures encore au stade "Estimée" peuvent être supprimées.
  if (v?.status === "ESTIMATED") await db.vehicle.delete({ where: { id } });
  redirect("/admin/stock");
}
