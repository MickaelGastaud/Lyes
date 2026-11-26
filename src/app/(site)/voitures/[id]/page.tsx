import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VehiclePhoto } from "@/components/VehiclePhoto";
import { CHECKPOINTS } from "@/lib/config";
import { db } from "@/lib/db";
import { formatEur, formatKm, FUEL_LABELS, GEARBOX_LABELS, parseJsonList } from "@/lib/format";
import { LeadForm } from "./LeadForm";

export const dynamic = "force-dynamic";

async function getVehicle(id: string) {
  return db.vehicle.findFirst({ where: { id, published: true, status: "FOR_SALE" } });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const v = await getVehicle((await params).id);
  if (!v) return { title: "Voiture introuvable" };
  return {
    title: `${v.make} ${v.model} ${v.year}`,
    description: `${v.make} ${v.model} ${v.trim ?? ""} ${v.year}, ${formatKm(v.mileage)}, ${formatEur(v.listPrice)}. Contrôlée et garantie ${v.warrantyMonths} mois.`,
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const v = await getVehicle((await params).id);
  if (!v) notFound();

  const checks = parseJsonList(v.checkpoints);
  const works = parseJsonList(v.works);
  const specs: [string, string][] = [
    ["Année", String(v.year)],
    ["Kilométrage", formatKm(v.mileage)],
    ["Énergie", FUEL_LABELS[v.fuel] ?? v.fuel],
    ["Boîte", GEARBOX_LABELS[v.gearbox] ?? v.gearbox],
    ["Carrosserie", v.bodyType],
    ["Places", String(v.seats)],
    ["Puissance", v.powerHp ? `${v.powerHp} ch` : "—"],
    ["Couleur", v.color ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/voitures" className="text-sm text-muted hover:text-ink">
        ← Retour aux voitures
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <VehiclePhoto
            photoUrl={v.photoUrl}
            color={v.color}
            label={`${v.make} ${v.model} ${v.trim ?? ""}, ${v.year}`}
            className="mx-auto max-w-2xl rounded-2xl"
            sizes="(min-width: 768px) 672px, 100vw"
            priority
          />

          <section>
            <h1 className="font-serif text-4xl text-night">
              {v.make} {v.model}
            </h1>
            {v.trim && <p className="mt-1 text-lg text-muted">{v.trim}</p>}
            {v.description && <p className="mt-4 leading-relaxed">{v.description}</p>}
          </section>

          <section className="card p-6">
            <h2 className="mb-4 font-serif text-2xl text-night">Caractéristiques</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {specs.map(([k, val]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                  <dd className="font-medium">{val}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-serif text-2xl text-night">Rapport de contrôle</h2>
            <p className="mb-4 mt-1 text-sm text-muted">
              {checks.length} points sur {CHECKPOINTS.length} vérifiés avant la mise en vente.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {CHECKPOINTS.map((c) => {
                const ok = checks.includes(c);
                return (
                  <li key={c} className={`flex items-start gap-2 text-sm ${ok ? "" : "text-muted"}`}>
                    <span className={ok ? "text-sage" : "text-muted"}>{ok ? "✓" : "○"}</span>
                    {c}
                  </li>
                );
              })}
            </ul>
          </section>

          {works.length > 0 && (
            <section className="card p-6">
              <h2 className="mb-4 font-serif text-2xl text-night">Travaux réalisés</h2>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {works.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="card p-6">
            <p className="text-sm text-muted">Prix</p>
            <p className="font-serif text-4xl text-night">{formatEur(v.listPrice)}</p>
            <ul className="mt-4 space-y-2 border-t border-sand pt-4 text-sm">
              <li>✓ Garantie {v.warrantyMonths} mois incluse, extensible</li>
              <li>✓ {checks.length} points de contrôle vérifiés</li>
              <li>✓ Historique et entretien vérifiés</li>
              <li>✓ Reprise de votre véhicule possible</li>
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="mb-4 font-serif text-xl text-night">Intéressé par cette voiture ?</h2>
            <LeadForm vehicleId={v.id} />
          </div>
        </aside>
      </div>
    </div>
  );
}
