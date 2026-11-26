import Link from "next/link";
import { PageTitle, StatusBadge } from "@/components/admin";
import { VEHICLE_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";
import { formatEur, formatKm } from "@/lib/format";
import { daysInStock, vehicleMargin } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export default async function StockPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = status && status in VEHICLE_STATUSES ? status : undefined;
  const vehicles = await db.vehicle.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageTitle title="Stock" subtitle="Toutes les voitures, de l'estimation à la vente.">
        <Link href="/admin/estimation" className="btn-brass">
          + Estimer une voiture
        </Link>
      </PageTitle>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/stock" className={`rounded-full px-3 py-1 ${!filter ? "bg-night text-white" : "bg-white ring-1 ring-sand"}`}>
          Toutes
        </Link>
        {Object.entries(VEHICLE_STATUSES).map(([key, label]) => (
          <Link key={key} href={`/admin/stock?status=${key}`} className={`rounded-full px-3 py-1 ${filter === key ? "bg-night text-white" : "bg-white ring-1 ring-sand"}`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Voiture</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Achat</th>
              <th className="px-4 py-3">Prix affiché / vendu</th>
              <th className="px-4 py-3">Marge nette</th>
              <th className="px-4 py-3">Jours en stock</th>
              <th className="px-4 py-3">Site</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const days = daysInStock(v);
              const price = v.soldPrice ?? v.listPrice;
              const margin = price ? vehicleMargin(v, price, days) : null;
              return (
                <tr key={v.id} className="border-t border-sand hover:bg-cream">
                  <td className="px-4 py-3">
                    <Link href={`/admin/stock/${v.id}`} className="font-medium text-night hover:underline">
                      {v.make} {v.model}
                    </Link>
                    <p className="text-xs text-muted">
                      {v.year} · {formatKm(v.mileage)} {v.plate ? `· ${v.plate}` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={v.status} />
                  </td>
                  <td className="px-4 py-3">
                    {formatEur(v.purchasePrice)}
                    {v.purchaseCountry !== "FR" && <span className="ml-1 text-xs text-muted">({v.purchaseCountry})</span>}
                  </td>
                  <td className="px-4 py-3">{formatEur(price)}</td>
                  <td className={`px-4 py-3 ${margin && margin.netMargin < 0 ? "text-danger" : ""}`}>{margin ? formatEur(margin.netMargin) : "—"}</td>
                  <td className="px-4 py-3">{days}</td>
                  <td className="px-4 py-3">{v.published ? <span className="text-sage">En ligne</span> : <span className="text-muted">—</span>}</td>
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  Aucune voiture à cette étape.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
