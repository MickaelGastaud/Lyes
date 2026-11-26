import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { TradeInForm } from "@/components/TradeInForm";
import { VehicleCard } from "@/components/VehicleCard";
import { BRAND, CHECKPOINTS } from "@/lib/config";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const EXAMPLES = ["SUV hybride moins de 35 000 €", "Break diesel automatique", "Électrique récente", "Familiale 7 places"];

/** Les trois piliers du modèle : achat-revente, remise à niveau, garantie. */
const PILLARS = [
  {
    kicker: "Achat-revente",
    title: "Nous achetons, puis nous revendons",
    text: "Chaque voiture nous appartient avant d'être à vous. Pas de mandat, pas de dépôt-vente : un seul interlocuteur, responsable de A à Z.",
  },
  {
    kicker: "Remise à niveau",
    title: `${CHECKPOINTS.length} points de contrôle`,
    text: "Contrôle, essai routier, entretien et travaux nécessaires avant la mise en vente. Le rapport complet est consultable sur chaque fiche.",
  },
  {
    kicker: "Garantie premium",
    title: "12 mois inclus, extensibles",
    text: "Chaque voiture est livrée garantie. Vous pouvez prolonger la couverture selon vos besoins, en toute clarté.",
  },
];

/** Le parcours d'une voiture, de notre achat jusqu'à la fidélisation du client. */
const JOURNEY = [
  { step: "01", title: "Sélection et achat", text: "Nous choisissons chaque voiture, vérifions son historique et l'achetons au juste prix du marché." },
  { step: "02", title: "Remise à niveau", text: `${CHECKPOINTS.length} points de contrôle, entretien à jour et travaux réalisés avant toute mise en vente.` },
  { step: "03", title: "Livraison garantie", text: "Garantie de 12 mois incluse, extension premium au choix, dossier complet remis à la livraison." },
  { step: "04", title: "Et après", text: "Reprise de votre ancienne voiture, puis, bientôt, engagement de rachat au prix du marché : nous restons à vos côtés." },
];

/** Comparaison des modes d'achat d'une voiture d'occasion. */
const COMPARISON: { label: string; private: string; broker: string; us: string }[] = [
  { label: "Qui vous vend la voiture ?", private: "Son propriétaire", broker: "Un intermédiaire, pour le compte d'un tiers", us: "Nous : elle nous appartient" },
  { label: "Contrôle et remise à niveau", private: "Rarement", broker: "Variable", us: `${CHECKPOINTS.length} points + travaux` },
  { label: "Garantie", private: "Vices cachés uniquement", broker: "Variable", us: "12 mois incluse, extensible" },
  { label: "Reprise de votre voiture", private: "Non", broker: "Variable", us: "Oui" },
  { label: "Engagement de rachat", private: "Non", broker: "Non", us: "Bientôt, au prix du marché" },
];

export default async function HomePage() {
  const latest = await db.vehicle.findMany({
    where: { published: true, status: "FOR_SALE" },
    orderBy: { listedAt: "desc" },
    take: 6,
  });

  return (
    <>
      {/* ——— Bandeau ——— */}
      <section className="relative overflow-hidden bg-night pb-20 text-white">
        <Image
          src="/images/banniere-accueil.webp"
          alt="Un client devant un SUV électrique noir, au coucher du soleil"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[30%_20%]"
        />
        {/* Dégradé : l'image reste visible en haut, le texte reste lisible en bas */}
        <div className="absolute inset-0 bg-linear-to-t from-night from-30% via-night/75 via-55% to-night/10" />
        <div className="relative mx-auto max-w-4xl px-4 pt-[clamp(14rem,34vw,26rem)] text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-brass">Achat-revente · Occasion premium · France</p>
          <h1 className="font-serif text-4xl leading-tight md:text-6xl">Achetez votre voiture en toute confiance.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">{BRAND.tagline}</p>
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

      {/* ——— Les trois piliers ——— */}
      <section id="engagements" className="relative z-10 mx-auto -mt-10 grid max-w-6xl gap-4 px-4 md:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="card border-t-2 border-t-brass p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-widest text-brass-dark">{p.kicker}</p>
            <h2 className="mt-2 font-serif text-xl text-night">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
          </div>
        ))}
      </section>

      {/* ——— Le parcours d'une voiture ——— */}
      <section id="parcours" className="mx-auto mt-20 max-w-6xl px-4">
        <p className="text-sm uppercase tracking-[0.2em] text-brass-dark">Notre méthode</p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl text-night md:text-4xl">Une voiture {BRAND.name} passe entre nos mains avant d&apos;arriver dans les vôtres.</h2>
        <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-brass/40 md:block" />
          {JOURNEY.map((j) => (
            <li key={j.step} className="relative">
              <span className="relative flex size-12 items-center justify-center rounded-full bg-night font-serif text-lg text-brass ring-4 ring-cream">{j.step}</span>
              <h3 className="mt-4 font-medium text-night">{j.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{j.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ——— Stock ——— */}
      <section className="mx-auto mt-20 max-w-6xl px-4">
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

      {/* ——— Notre différence ——— */}
      <section id="difference" className="mt-20 bg-night py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm uppercase tracking-[0.2em] text-brass">Notre différence</p>
          <h2 className="mt-2 max-w-2xl font-serif text-3xl md:text-4xl">Acheter à un professionnel qui s&apos;engage, pas à un intermédiaire.</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-white/50">
                  <th className="py-3 pr-4 font-medium">
                    <span className="sr-only">Critère</span>
                  </th>
                  <th className="px-4 py-3 font-medium">Entre particuliers</th>
                  <th className="px-4 py-3 font-medium">Mandataire ou dépôt-vente</th>
                  <th className="rounded-t-xl bg-brass/15 px-4 py-3 font-semibold text-brass">{BRAND.name}</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.label} className="border-t border-white/10">
                    <th scope="row" className="py-4 pr-4 font-medium text-white">
                      {row.label}
                    </th>
                    <td className="px-4 py-4 text-white/60">{row.private}</td>
                    <td className="px-4 py-4 text-white/60">{row.broker}</td>
                    <td className={`bg-brass/15 px-4 py-4 font-medium text-white ${i === COMPARISON.length - 1 ? "rounded-b-xl" : ""}`}>✓ {row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ——— Garanties ——— */}
      <section id="garanties" className="mx-auto mt-20 max-w-6xl px-4">
        <p className="text-sm uppercase tracking-[0.2em] text-brass-dark">Garanties</p>
        <h2 className="mt-2 max-w-2xl font-serif text-3xl text-night md:text-4xl">Une garantie incluse, une extension si vous le souhaitez.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">Incluse sur chaque voiture</p>
            <h3 className="mt-2 font-serif text-2xl text-night">Garantie {BRAND.name} · 12 mois</h3>
            <ul className="mt-5 space-y-2 text-sm">
              <li>✓ Comprise dans le prix affiché, sans supplément</li>
              <li>✓ Active dès la livraison de votre voiture</li>
              <li>✓ S&apos;ajoute aux garanties légales du vendeur professionnel</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-night p-8 text-white">
            <p className="text-xs font-medium uppercase tracking-widest text-brass">En option</p>
            <h3 className="mt-2 font-serif text-2xl">Extension premium</h3>
            <ul className="mt-5 space-y-2 text-sm text-white/85">
              <li>✓ Prolongez votre couverture au-delà de 12 mois</li>
              <li>✓ Une durée adaptée à votre usage</li>
              <li>✓ À choisir avec votre conseiller lors de l&apos;achat</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ——— Reprise et rachat garanti ——— */}
      <section id="services" className="mx-auto mt-20 max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[1fr_440px]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-brass-dark">Fidélité</p>
            <h2 className="mt-2 font-serif text-3xl text-night md:text-4xl">Nous pensons déjà à votre prochaine voiture.</h2>
            <div className="mt-8 space-y-6">
              <div className="border-l-2 border-brass pl-5">
                <h3 className="font-medium text-night">Reprise de votre voiture actuelle</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Vous changez de voiture ? Nous reprenons la vôtre, au prix du marché, lors de votre achat. Une seule démarche, un seul interlocuteur.
                </p>
              </div>
              <div className="border-l-2 border-brass/40 pl-5">
                <h3 className="flex flex-wrap items-center gap-2 font-medium text-night">
                  Engagement de rachat
                  <span className="rounded-full bg-brass/15 px-2 py-0.5 text-xs font-normal text-brass-dark">Bientôt</span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Dès l&apos;achat, nous nous engageons à racheter votre voiture au prix du marché après une durée convenue. Vous savez que vous ne resterez jamais sans
                  solution.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6 shadow-sm">
            <h3 className="font-serif text-xl text-night">Faire reprendre ma voiture</h3>
            <p className="mb-4 mt-1 text-sm text-muted">Gratuit et sans engagement.</p>
            <TradeInForm />
          </div>
        </div>
      </section>
    </>
  );
}
