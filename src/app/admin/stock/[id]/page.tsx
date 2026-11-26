import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, StatusBadge } from "@/components/admin";
import { db } from "@/lib/db";
import { daysForPriceFromResult } from "@/lib/estimation/estimate";
import { runEstimation } from "@/lib/estimation/run";
import type { Fuel, Gearbox } from "@/lib/estimation/types";
import { formatDate, formatEur, formatKm, FUEL_LABELS, parseJsonList } from "@/lib/format";
import { daysInStock, vehicleMargin } from "@/lib/vehicles";
import { deleteVehicle } from "./actions";
import { isPhotoStorageEnabled } from "@/lib/photos";
import { PhotoUploader } from "./PhotoUploader";
import { VehicleForm } from "./VehicleForm";

export const dynamic = "force-dynamic";

export default async function StockVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await db.vehicle.findUnique({
    where: { id },
    include: { estimations: { orderBy: { createdAt: "desc" } }, leads: { orderBy: { createdAt: "desc" } } },
  });
  if (!v) notFound();

  const days = daysInStock(v);
  const market = await runEstimation(
    { make: v.make, model: v.model, year: v.year, mileage: v.mileage, fuel: v.fuel as Fuel, gearbox: v.gearbox as Gearbox },
    null,
  );
  const price = v.soldPrice ?? v.listPrice;
  const margin = price ? vehicleMargin(v, price, days) : null;
  const expectedDays = market && v.listPrice && v.status !== "SOLD" ? daysForPriceFromResult(market, v.listPrice) : null;

  return (
    <>
      <Link href="/admin/stock" className="text-sm text-muted hover:text-ink">
        ← Retour au stock
      </Link>
      <PageTitle
        title={`${v.make} ${v.model}`}
        subtitle={`${v.year} · ${formatKm(v.mileage)} · ${FUEL_LABELS[v.fuel] ?? v.fuel}${v.plate ? ` · ${v.plate}` : ""}`}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={v.status} />
          {v.published && (
            <Link href={`/voitures/${v.id}`} className="btn-ghost text-xs" target="_blank">
              Voir sur le site ↗
            </Link>
          )}
        </div>
      </PageTitle>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <PhotoUploader
            vehicleId={v.id}
            photoUrl={v.photoUrl}
            color={v.color}
            label={`${v.make} ${v.model}`}
            storageEnabled={isPhotoStorageEnabled()}
          />
          <VehicleForm v={{ ...v, checkpoints: parseJsonList(v.checkpoints), works: parseJsonList(v.works) }} />
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 font-serif text-lg text-night">Rentabilité</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Jours en stock</dt>
                <dd>{days}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{v.soldPrice ? "Prix de vente réel" : "Prix affiché"}</dt>
                <dd>{formatEur(price)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>{v.status === "SOLD" ? "Marge nette réalisée" : "Marge nette à ce jour"}</dt>
                <dd className={margin && margin.netMargin < 0 ? "text-danger" : ""}>{margin ? formatEur(margin.netMargin) : "—"}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">Inclut garantie, coût de stock à ce jour et TVA sur marge.</p>
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-serif text-lg text-night">Marché actuel</h2>
            {market ? (
              <>
                <p className="text-sm">
                  Prix de référence : <strong>{formatEur(market.referencePrice)}</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {market.horizons.map((h) => (
                    <li key={h.days} className="flex justify-between">
                      <span className="text-muted">Vendre en {h.days} j</span>
                      <span>{formatEur(h.price)}</span>
                    </li>
                  ))}
                </ul>
                {expectedDays !== null && (
                  <p className="mt-3 rounded-lg bg-sand/60 p-2 text-xs">
                    Au prix affiché ({formatEur(v.listPrice)}), délai de vente estimé : <strong>{expectedDays} jours</strong>.
                  </p>
                )}
                <p className="mt-2 text-xs text-muted">
                  Confiance {market.confidence} · {market.comparablesCount} comparables
                </p>
              </>
            ) : (
              <p className="text-sm text-muted">Pas de données de marché pour ce modèle.</p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-serif text-lg text-night">Historique</h2>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-muted">Achat</span>
                {formatDate(v.purchasedAt)}
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Mise en vente</span>
                {formatDate(v.listedAt)}
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Vente</span>
                {formatDate(v.soldAt)}
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Estimations</span>
                {v.estimations.length}
              </li>
              <li className="flex justify-between">
                <span className="text-muted">Demandes clients</span>
                {v.leads.length}
              </li>
            </ul>
          </div>

          {v.status === "ESTIMATED" && (
            <form action={deleteVehicle}>
              <input type="hidden" name="id" value={v.id} />
              <button className="w-full text-center text-xs text-danger hover:underline">Supprimer cette voiture estimée</button>
            </form>
          )}
        </aside>
      </div>
    </>
  );
}
