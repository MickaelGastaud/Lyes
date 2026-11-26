"use server";

import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAcceptablePhotoUrl, isBlobUrl } from "@/lib/photos";

export type PhotoResult = { ok: boolean; message: string };

/** Supprime une ancienne photo du stockage, sans bloquer si ça échoue. */
async function deleteStoredPhoto(url: string | null) {
  if (!isBlobUrl(url)) return;
  try {
    await del(url!);
  } catch (e) {
    console.error("Suppression de l'ancienne photo impossible :", e);
  }
}

function refresh(vehicleId: string) {
  revalidatePath(`/admin/stock/${vehicleId}`);
  revalidatePath("/admin/stock");
  revalidatePath("/", "layout");
}

/** Enregistre la nouvelle photo principale d'une voiture (et supprime l'ancienne du stockage). */
export async function setVehiclePhoto(vehicleId: string, url: string): Promise<PhotoResult> {
  const clean = url.trim();
  if (!isAcceptablePhotoUrl(clean)) return { ok: false, message: "Adresse de photo invalide (https://… ou /images/…)." };
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { photoUrl: true } });
  if (!vehicle) return { ok: false, message: "Voiture introuvable." };

  await db.vehicle.update({ where: { id: vehicleId }, data: { photoUrl: clean } });
  if (vehicle.photoUrl !== clean) await deleteStoredPhoto(vehicle.photoUrl);
  refresh(vehicleId);
  return { ok: true, message: "Photo enregistrée." };
}

/** Retire la photo principale (la voiture retrouve sa silhouette). */
export async function removeVehiclePhoto(vehicleId: string): Promise<PhotoResult> {
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { photoUrl: true } });
  if (!vehicle) return { ok: false, message: "Voiture introuvable." };
  await db.vehicle.update({ where: { id: vehicleId }, data: { photoUrl: null } });
  await deleteStoredPhoto(vehicle.photoUrl);
  refresh(vehicleId);
  return { ok: true, message: "Photo retirée." };
}
