import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isPhotoStorageEnabled, PHOTO_MAX_BYTES, PHOTO_TYPES } from "@/lib/photos";

/**
 * Délivre au navigateur un « badge » temporaire pour déposer une photo dans Vercel Blob.
 * Route protégée par le mot de passe du back-office (middleware sur /admin).
 */
export async function POST(request: Request) {
  if (!isPhotoStorageEnabled()) {
    return NextResponse.json(
      { error: "Stockage des photos non configuré : reliez un store Vercel Blob au projet." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const vehicleId = clientPayload ?? "";
        if (!pathname.startsWith(`vehicules/${vehicleId}`)) throw new Error("Chemin de fichier invalide.");
        const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId }, select: { id: true } });
        if (!vehicle) throw new Error("Voiture introuvable.");
        return {
          allowedContentTypes: PHOTO_TYPES,
          maximumSizeInBytes: PHOTO_MAX_BYTES,
          addRandomSuffix: true,
        };
      },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur d'envoi." }, { status: 400 });
  }
}
