"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { VehiclePhoto } from "@/components/VehiclePhoto";
import { removeVehiclePhoto, setVehiclePhoto } from "@/app/admin/photos/actions";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_MB = 15;
/** Si l'envoi n'avance plus pendant ce délai, on l'arrête (réseau coupé, stockage injoignable…). */
const STALL_MS = 45_000;

export function PhotoUploader({
  vehicleId,
  photoUrl,
  color,
  label,
  storageEnabled,
}: {
  vehicleId: string;
  photoUrl: string | null;
  color: string | null;
  label: string;
  storageEnabled: boolean;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const busy = progress !== null || pending;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    if (!TYPES.includes(file.type)) return setMessage({ ok: false, text: "Format accepté : JPEG, PNG, WebP ou AVIF." });
    if (file.size > MAX_MB * 1024 * 1024) return setMessage({ ok: false, text: `Photo trop lourde (maximum ${MAX_MB} Mo).` });

    // Chien de garde : relancé à chaque progrès, il annule l'envoi s'il reste bloqué.
    const controller = new AbortController();
    let watchdog = setTimeout(() => controller.abort(), STALL_MS);
    const bump = () => {
      clearTimeout(watchdog);
      watchdog = setTimeout(() => controller.abort(), STALL_MS);
    };

    try {
      setProgress(0);
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const blob = await upload(`vehicules/${vehicleId}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/admin/photos/upload",
        clientPayload: vehicleId,
        multipart: file.size > 5 * 1024 * 1024,
        abortSignal: controller.signal,
        onUploadProgress: ({ percentage }) => {
          bump();
          setProgress(Math.round(percentage));
        },
      });
      clearTimeout(watchdog);
      const res = await setVehiclePhoto(vehicleId, blob.url);
      setMessage({ ok: res.ok, text: res.message });
      router.refresh();
    } catch (e) {
      const text = controller.signal.aborted
        ? "Envoi impossible : le stockage ne répond pas. Vérifiez la connexion et réessayez."
        : `Envoi impossible : ${e instanceof Error ? e.message : "erreur inconnue"}`;
      setMessage({ ok: false, text });
    } finally {
      clearTimeout(watchdog);
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  function run(action: () => Promise<{ ok: boolean; message: string }>) {
    setMessage(null);
    startTransition(async () => {
      const res = await action();
      setMessage({ ok: res.ok, text: res.message });
      if (res.ok) {
        setManualUrl("");
        router.refresh();
      }
    });
  }

  return (
    <section className="card space-y-4 p-5">
      <h2 className="font-serif text-xl text-night">Photo principale</h2>

      <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
        <VehiclePhoto photoUrl={photoUrl} color={color} label={label} className="rounded-xl" sizes="260px" />

        <div className="space-y-3">
          {storageEnabled ? (
            <>
              <input
                ref={input}
                type="file"
                accept={TYPES.join(",")}
                disabled={busy}
                onChange={(e) => onFile(e.target.files?.[0])}
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-night file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-night-soft"
              />
              <p className="text-xs text-muted">
                JPEG, PNG, WebP ou AVIF, jusqu&apos;à {MAX_MB} Mo. Format conseillé : 1100 × 926 pixels. Une nouvelle photo remplace l&apos;ancienne.
              </p>
            </>
          ) : (
            <p className="rounded-lg bg-sand/60 p-3 text-xs">
              L&apos;envoi de photos sera disponible une fois le stockage Vercel Blob relié au projet (Vercel → Storage → Blob). En attendant, vous pouvez coller l&apos;adresse d&apos;une image ci-dessous.
            </p>
          )}

          {progress !== null && (
            <div className="h-2 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-brass transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}

          <details className="text-sm">
            <summary className="cursor-pointer text-muted hover:text-ink">Ou coller l&apos;adresse d&apos;une image</summary>
            <div className="mt-2 flex gap-2">
              <input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://… ou /images/vehicules/…"
                className="field"
                aria-label="Adresse de la photo"
              />
              <button type="button" disabled={busy || !manualUrl.trim()} onClick={() => run(() => setVehiclePhoto(vehicleId, manualUrl))} className="btn-ghost shrink-0">
                Utiliser
              </button>
            </div>
          </details>

          {photoUrl && (
            <button type="button" disabled={busy} onClick={() => run(() => removeVehiclePhoto(vehicleId))} className="text-xs text-danger hover:underline">
              Retirer la photo
            </button>
          )}

          {message && <p className={`text-sm ${message.ok ? "text-sage" : "text-danger"}`}>{message.text}</p>}
        </div>
      </div>
    </section>
  );
}
