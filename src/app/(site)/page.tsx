import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { VehicleCard } from "@/components/VehicleCard";
import { BRAND, CHECKPOINTS } from "@/lib/config";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const EXAMPLES = ["SUV hybride moins de 35 000 €", "Break diesel automatique", "Électrique récente", "Familiale 7 places"];

const PROMISES = [
  { title: `${CHECKPOINTS.length} points de contrôle`, text: "Chaque voiture est inspectée, essayée et remise en état avant sa mise en vente. Le rapport est consultable sur sa fiche." },
  { title: "Garantie incluse", text: "12 mois de garantie sur chaque voiture, avec possibilité d'extension. Pas de mandat, pas de dépôt-vente : nous vendons ce que nous avons acheté." },
  { title: "Prix juste et transparent", text: "Nos prix sont calculés sur les ventes réelles du marché français. Historique, entretien et travaux réalisés : tout est affiché." },
];

const SERVICES = [
  { title: "Extension de garantie", text: "Prolongez votre tranquillité au-delà des 12 mois inclus." },
  { title: "Reprise de votre véhicule", text: "Nous reprenons votre voiture actuelle lors de votre achat." },
  { title: "Rachat garanti", text: "Nous nous engageons à racheter votre voiture au prix du marché après une durée convenue." },
];

export default async function HomePage() {
  const latest = await db.vehicle.findMany({
    where: { published: true, status: "FOR_SALE" },
    orderBy: { listedAt: "desc" },
    take: 6,
  });

  return (
    <>
      <section className="bg-night pb-20 pt-16 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-brass">Occasion premium · France</p>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">Achetez votre voiture en toute confiance.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">{BRAND.tagline}</p>
          <div className="mx-auto mt-10 max-w-3xl">
            <SearchBar />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <Link
                  key={ex}
                  href={`/voitures?q=${encodeURIComponent(ex)}`}
                  className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 transition hover:border-brass hover:text-white"
                >
                  {ex}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="engagements" className="mx-auto -mt-10 grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {PROMISES.map((p) => (
          <div key={p.title} className="card p-6 shadow-sm">
            <h2 className="font-serif text-xl text-night">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-3xl text-night">Dernières arrivées</h2>
          <Link href="/voitures" className="text-sm font-medium text-brass-dark hover:underline">
            Voir tout le stock →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto mt-16 max-w-6xl px-4">
        <h2 className="mb-6 font-serif text-3xl text-night">Et après l&apos;achat</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="rounded-2xl border border-dashed border-brass/50 p-6">
              <h3 className="font-medium text-night">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-brass-dark">Bientôt disponible</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
