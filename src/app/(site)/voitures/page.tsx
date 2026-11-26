import type { Metadata } from "next";
import { SearchBar } from "@/components/SearchBar";
import { VehicleCard } from "@/components/VehicleCard";
import { db } from "@/lib/db";
import { parseQuery } from "@/lib/search/parse";
import { rankVehicles } from "@/lib/search/rank";

export const metadata: Metadata = { title: "Nos voitures" };
export const dynamic = "force-dynamic";

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const stock = await db.vehicle.findMany({
    where: { published: true, status: "FOR_SALE" },
    orderBy: { listedAt: "desc" },
  });

  const parsed = q.trim() ? parseQuery(q) : null;
  const { exact, close } = parsed ? rankVehicles(stock, parsed.criteria) : { exact: stock, close: [] };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 font-serif text-4xl text-night">Nos voitures</h1>
      <SearchBar defaultValue={q} size="md" />

      {parsed && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Nous avons compris :</span>
          {parsed.understood.length ? (
            parsed.understood.map((u) => (
              <span key={u} className="rounded-full bg-night px-3 py-1 text-white">
                {u}
              </span>
            ))
          ) : (
            <span className="text-muted italic">aucun critère précis, voici tout notre stock.</span>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-muted">
        {exact.length} voiture{exact.length > 1 ? "s" : ""} correspond{exact.length > 1 ? "ent" : ""} à votre recherche
      </p>
      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exact.map((v) => (
          <VehicleCard key={v.id} v={v} />
        ))}
      </div>

      {close.length > 0 && (
        <>
          <h2 className="mt-10 font-serif text-2xl text-night">Les plus proches de votre demande</h2>
          <p className="mt-1 text-sm text-muted">Elles ne cochent pas tous vos critères, mais pourraient vous plaire.</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {close.map((v) => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
