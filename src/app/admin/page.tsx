import Link from "next/link";
import { Kpi, PageTitle, StatusBadge } from "@/components/admin";
import { VEHICLE_STATUSES, type VehicleStatus } from "@/lib/config";
import { db } from "@/lib/db";
import { formatDate, formatEur } from "@/lib/format";
import { daysBetween, daysInStock, vehicleMargin } from "@/lib/vehicles";
import { markLeadHandled } from "./actions";

export const dynamic = "force-dynamic";

const LEAD_TYPES: Record<string, string> = { ESSAI: "Essai", RESERVATION: "Réservation", QUESTION: "Question", REPRISE: "Reprise" };

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export default async function DashboardPage() {
  const [vehicles, leads] = await Promise.all([
    db.vehicle.findMany({ include: { estimations: { orderBy: { createdAt: "desc" }, take: 1 } } }),
    db.lead.findMany({ where: { handled: false }, include: { vehicle: true }, orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const byStatus = Object.keys(VEHICLE_STATUSES).map((s) => ({ status: s, count: vehicles.filter((v) => v.status === s).length }));
  const forSale = vehicles.filter((v) => v.status === "FOR_SALE");
  const sold = vehicles.filter((v) => v.status === "SOLD" && v.soldPrice);

  const realizedMargins = sold.map((v) => vehicleMargin(v, v.soldPrice!, daysInStock(v))?.netMargin).filter((m): m is number => m !== undefined);
  const daysToSell = sold.map((v) => daysBetween(v.listedAt, v.soldAt)).filter((d): d is number => d !== null);
  const daysOnSale = forSale.map((v) => daysBetween(v.listedAt, new Date())).filter((d): d is number => d !== null);

  // Écart entre le prix estimé et le prix réellement obtenu (voitures vendues ayant une estimation).
  const gaps = sold
    .filter((v) => v.estimations[0])
    .map((v) => {
      const r = JSON.parse(v.estimations[0].result) as { horizons: { days: number; price: number }[] };
      const realDays = daysBetween(v.listedAt, v.soldAt) ?? 45;
      const closest = r.horizons.reduce((a, b) => (Math.abs(b.days - realDays) < Math.abs(a.days - realDays) ? b : a));
      return ((v.soldPrice! - closest.price) / closest.price) * 100;
    });

  return (
    <>
      <PageTitle title="Tableau de bord" subtitle="Vue d'ensemble du stock, des ventes et des demandes clients.">
        <Link href="/admin/estimation" className="btn-brass">
          + Estimer une voiture
        </Link>
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Voitures en vente" value={String(forSale.length)} hint={`Valeur affichée : ${formatEur(forSale.reduce((s, v) => s + (v.listPrice ?? 0), 0))}`} />
        <Kpi label="Marge nette moyenne réalisée" value={formatEur(avg(realizedMargins))} hint={`Sur ${sold.length} ventes`} />
        <Kpi label="Délai de vente moyen" value={avg(daysToSell) === null ? "—" : `${avg(daysToSell)} jours`} hint="De la mise en ligne à la vente" />
        <Kpi
          label="Écart estimation / vente"
          value={gaps.length ? `${(gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1)} %` : "—"}
          hint={gaps.length ? `Sur ${gaps.length} ventes estimées` : "Disponible après les premières ventes estimées"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="card p-5">
          <h2 className="mb-4 font-serif text-xl text-night">Stock par étape</h2>
          <ul className="space-y-3">
            {byStatus.map(({ status, count }) => (
              <li key={status}>
                <Link href={`/admin/stock?status=${status}`} className="flex items-center justify-between rounded-lg px-2 py-1 hover:bg-sand/40">
                  <StatusBadge status={status} />
                  <span className="font-semibold">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-sand pt-3 text-xs text-muted">
            En vente depuis {avg(daysOnSale) ?? "—"} jours en moyenne ({VEHICLE_STATUSES["FOR_SALE" as VehicleStatus].toLowerCase()}).
          </p>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-serif text-xl text-night">Demandes clients à traiter</h2>
          {leads.length === 0 ? (
            <p className="text-sm text-muted">Aucune demande en attente.</p>
          ) : (
            <ul className="divide-y divide-sand">
              {leads.map((l) => (
                <li key={l.id} className="flex flex-wrap items-start justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium">
                      {LEAD_TYPES[l.type] ?? l.type} · {l.name}
                    </p>
                    <p className="text-muted">
                      {l.email}
                      {l.phone ? ` · ${l.phone}` : ""} · {formatDate(l.createdAt)}
                    </p>
                    {l.vehicle && (
                      <Link href={`/admin/stock/${l.vehicle.id}`} className="text-brass-dark hover:underline">
                        {l.vehicle.make} {l.vehicle.model} {l.vehicle.year}
                      </Link>
                    )}
                    {l.message && <p className="mt-1 text-muted italic">« {l.message} »</p>}
                  </div>
                  <form action={markLeadHandled}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="btn-ghost text-xs">Marquer traitée</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
