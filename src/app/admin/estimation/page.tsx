import Link from "next/link";
import { PageTitle } from "@/components/admin";
import { PriceDelayChart } from "@/components/PriceDelayChart";
import { CATALOG, FUELS, GEARBOXES, MAKES } from "@/lib/catalog";
import { DEFAULT_COSTS } from "@/lib/config";
import { readEstimationParams, runEstimation, toCosts, toSpec } from "@/lib/estimation/run";
import { formatEur, formatKm, FUEL_LABELS } from "@/lib/format";
import { DEMO_PLATE_LIST, demoIdentifier } from "@/lib/identification";
import { saveEstimation } from "./actions";

export const dynamic = "force-dynamic";

const COUNTRIES = [
  { value: "FR", label: "France" },
  { value: "DE", label: "Allemagne" },
  { value: "BE", label: "Belgique" },
  { value: "ES", label: "Espagne" },
  { value: "IT", label: "Italie" },
  { value: "AUTRE", label: "Autre pays" },
];

const CONFIDENCE_STYLE = { élevée: "text-sage", moyenne: "text-brass-dark", faible: "text-danger" };

export default async function EstimationPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const params = readEstimationParams(sp);

  // Identification par plaque : pré-remplit le formulaire si la voiture est reconnue.
  let plateMessage: string | null = null;
  if (params.plate && !params.make) {
    const found = await demoIdentifier.identify(params.plate);
    if (found) {
      Object.assign(params, { make: found.make, model: found.model, trim: found.trim, year: found.year, fuel: found.fuel, gearbox: found.gearbox });
      plateMessage = `Voiture identifiée : ${found.make} ${found.model} ${found.trim ?? ""} (${found.year}). Complétez le kilométrage et le prix d'achat.`;
    } else {
      plateMessage = "Plaque inconnue du service de démonstration : saisissez la voiture à la main.";
    }
  }

  const spec = toSpec(params);
  const costs = toCosts(params);
  const result = spec ? await runEstimation(spec, costs) : null;
  const best = result?.bestHorizon;

  return (
    <>
      <PageTitle
        title="Estimer une voiture"
        subtitle="Prix de vente réel sur le marché français, selon le délai de vente, et marge nette attendue."
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* ——— Formulaire ——— */}
        <div className="space-y-4">
          <form method="get" className="card space-y-3 p-5">
            <label className="label" htmlFor="plate">
              Plaque d&apos;immatriculation
            </label>
            <div className="flex gap-2">
              <input id="plate" name="plate" defaultValue={params.plate} placeholder="AB-123-CD" className="field uppercase" />
              <button className="btn-ghost shrink-0">Identifier</button>
            </div>
            <p className="text-xs text-muted">Démo : {DEMO_PLATE_LIST.join(", ")}</p>
            {plateMessage && <p className="rounded-lg bg-sand/60 p-2 text-xs">{plateMessage}</p>}
          </form>

          <form method="get" className="card space-y-4 p-5">
            {params.plate && <input type="hidden" name="plate" value={params.plate} />}
            {params.trim && <input type="hidden" name="trim" value={params.trim} />}
            <fieldset className="space-y-3">
              <legend className="mb-2 font-medium text-night">La voiture</legend>
              <div>
                <label className="label" htmlFor="vehicle">
                  Modèle
                </label>
                <select id="vehicle" name="vehicle" required className="field" defaultValue={params.make ? `${params.make}|${params.model}` : ""}>
                  <option value="" disabled>
                    Choisir…
                  </option>
                  {MAKES.map((make) => (
                    <optgroup key={make} label={make}>
                      {CATALOG.filter((m) => m.make === make).map((m) => (
                        <option key={m.model} value={`${m.make}|${m.model}`}>
                          {m.make} {m.model}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="year">
                    Année
                  </label>
                  <input id="year" name="year" type="number" min={2000} max={new Date().getFullYear()} required defaultValue={params.year} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="mileage">
                    Kilométrage
                  </label>
                  <input id="mileage" name="mileage" type="number" min={0} step={500} required defaultValue={params.mileage} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="fuel">
                    Énergie
                  </label>
                  <select id="fuel" name="fuel" className="field" defaultValue={params.fuel ?? ""}>
                    <option value="">Indifférent</option>
                    {FUELS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="gearbox">
                    Boîte
                  </label>
                  <select id="gearbox" name="gearbox" className="field" defaultValue={params.gearbox ?? ""}>
                    <option value="">Indifférent</option>
                    {GEARBOXES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="space-y-3 border-t border-sand pt-4">
              <legend className="mb-2 font-medium text-night">L&apos;achat</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="purchasePrice">
                    Prix d&apos;achat (€)
                  </label>
                  <input id="purchasePrice" name="purchasePrice" type="number" min={0} step={100} defaultValue={params.purchasePrice} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="country">
                    Pays d&apos;achat
                  </label>
                  <select id="country" name="country" className="field" defaultValue={params.country}>
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="reconditioning">
                    Remise en état (€)
                  </label>
                  <input id="reconditioning" name="reconditioning" type="number" min={0} step={50} defaultValue={params.reconditioning} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="importCosts">
                    Frais d&apos;import (€)
                  </label>
                  <input id="importCosts" name="importCosts" type="number" min={0} step={50} defaultValue={params.importCosts} placeholder="auto" className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="warrantyCost">
                    Coût garantie (€)
                  </label>
                  <input id="warrantyCost" name="warrantyCost" type="number" min={0} step={50} defaultValue={params.warrantyCost} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="holdingCostPerDay">
                    Coût stock / jour (€)
                  </label>
                  <input id="holdingCostPerDay" name="holdingCostPerDay" type="number" min={0} defaultValue={params.holdingCostPerDay} className="field" />
                </div>
              </div>
              <p className="text-xs text-muted">
                Frais d&apos;import « auto » : transport, certificat de conformité et carte grise (
                {formatEur(DEFAULT_COSTS.import.transport + DEFAULT_COSTS.import.coc + DEFAULT_COSTS.import.registration)}). Ajoutez le malus écologique s&apos;il s&apos;applique.
              </p>
            </fieldset>

            <button className="btn-primary w-full">Estimer</button>
          </form>
        </div>

        {/* ——— Résultat ——— */}
        <div className="space-y-6">
          {!spec && (
            <div className="card flex h-full min-h-60 items-center justify-center p-10 text-center text-muted">
              Identifiez une voiture par sa plaque ou choisissez un modèle, puis renseignez l&apos;année et le kilométrage.
            </div>
          )}

          {spec && !result && (
            <div className="card p-8 text-center text-muted">
              Aucune annonce comparable sur le marché pour ce modèle et cette année. Impossible d&apos;estimer de façon fiable.
            </div>
          )}

          {result && spec && (
            <>
              {best && (
                <div className={`rounded-2xl p-5 ${result.isGoodDeal ? "bg-sage/10 ring-1 ring-sage/30" : "bg-danger/10 ring-1 ring-danger/30"}`}>
                  <p className={`text-sm font-semibold ${result.isGoodDeal ? "text-sage" : "text-danger"}`}>
                    {result.isGoodDeal ? "✓ Bonne affaire" : "✗ Marge insuffisante"}
                  </p>
                  <p className="mt-1 text-lg">
                    Meilleure option : vendre <strong>{formatEur(best.price)}</strong> en <strong>{best.days} jours</strong>, pour une marge nette de{" "}
                    <strong>{formatEur(best.margin!.netMargin)}</strong>.
                  </p>
                  <p className="mt-1 text-xs text-muted">Seuil de marge minimale : {formatEur(DEFAULT_COSTS.minNetMargin)}.</p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="card p-5">
                  <p className="text-xs uppercase tracking-wide text-muted">Prix de référence du marché</p>
                  <p className="mt-1 text-2xl font-semibold text-night">{formatEur(result.referencePrice)}</p>
                  <p className="mt-1 text-xs text-muted">Médiane des comparables ajustés</p>
                </div>
                <div className="card p-5">
                  <p className="text-xs uppercase tracking-wide text-muted">Délai de vente médian constaté</p>
                  <p className="mt-1 text-2xl font-semibold text-night">{result.medianDaysToSell ? `${result.medianDaysToSell} jours` : "—"}</p>
                  <p className="mt-1 text-xs text-muted">Sur {result.soldCount} ventes comparables</p>
                </div>
                <div className="card p-5">
                  <p className="text-xs uppercase tracking-wide text-muted">Confiance</p>
                  <p className={`mt-1 text-2xl font-semibold ${CONFIDENCE_STYLE[result.confidence]}`}>
                    {result.confidence} <span className="text-base text-muted">({result.confidenceScore}/100)</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {result.comparablesCount} comparables · courbe : {result.curveSource}
                  </p>
                </div>
              </div>

              <div className="card p-5">
                <h2 className="font-serif text-xl text-night">Prix de vente selon le délai</h2>
                <p className="mb-2 text-sm text-muted">Plus on accepte d&apos;attendre, plus le prix espéré monte. La bande montre la fourchette probable.</p>
                <PriceDelayChart horizons={result.horizons} best={best?.days} />
              </div>

              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3">Vendre en</th>
                      <th className="px-4 py-3">Fourchette</th>
                      <th className="px-4 py-3">Prix conseillé</th>
                      {costs && <th className="px-4 py-3">Coût de stock</th>}
                      {costs && <th className="px-4 py-3">TVA sur marge</th>}
                      {costs && <th className="px-4 py-3 text-right">Marge nette</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {result.horizons.map((h) => (
                      <tr key={h.days} className={`border-t border-sand ${h.days === best?.days ? "bg-brass/10 font-medium" : ""}`}>
                        <td className="px-4 py-3">{h.days} jours</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted">
                          {formatEur(h.low)} – {formatEur(h.high)}
                        </td>
                        <td className="px-4 py-3">{formatEur(h.price)}</td>
                        {h.margin && <td className="px-4 py-3 text-muted">{formatEur(h.margin.holdingCost)}</td>}
                        {h.margin && <td className="px-4 py-3 text-muted">{formatEur(h.margin.vatOnMargin)}</td>}
                        {h.margin && (
                          <td className={`px-4 py-3 text-right ${h.margin.netMargin < 0 ? "text-danger" : "text-night"}`}>{formatEur(h.margin.netMargin)}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!costs && <p className="border-t border-sand px-4 py-3 text-sm text-muted">Renseignez un prix d&apos;achat pour calculer la marge.</p>}
              </div>

              {best?.margin && (
                <div className="card p-5">
                  <h2 className="mb-3 font-serif text-xl text-night">Détail de la marge ({best.days} jours)</h2>
                  <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    {[
                      ["Prix de vente", best.margin.salePrice, 1],
                      ["Prix d'achat", best.margin.purchasePrice, -1],
                      ["Remise en état", best.margin.reconditioning, -1],
                      ["Frais d'import", best.margin.importCosts, -1],
                      ["Garantie incluse", best.margin.warrantyCost, -1],
                      [`Stock (${best.days} j × ${formatEur(params.holdingCostPerDay)})`, best.margin.holdingCost, -1],
                      ["TVA sur marge (20 %)", best.margin.vatOnMargin, -1],
                    ].map(([label, value, sign]) => (
                      <div key={label as string} className="flex justify-between border-b border-sand/60 py-1">
                        <dt className="text-muted">{label}</dt>
                        <dd>
                          {(sign as number) < 0 ? "− " : ""}
                          {formatEur(value as number)}
                        </dd>
                      </div>
                    ))}
                    <div className="flex justify-between py-1 font-semibold sm:col-span-2">
                      <dt>Marge nette</dt>
                      <dd>{formatEur(best.margin.netMargin)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-muted">Hypothèse : régime de la TVA sur marge (voiture achetée à un particulier ou sous ce régime).</p>
                </div>
              )}

              <div className="card overflow-x-auto">
                <h2 className="px-5 pt-5 font-serif text-xl text-night">Annonces comparables</h2>
                <p className="px-5 pb-3 text-sm text-muted">Les plus proches de la voiture estimée. Une annonce retirée est considérée comme vendue.</p>
                <table className="w-full text-sm">
                  <thead className="bg-sand/40 text-left text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-2">Voiture</th>
                      <th className="px-4 py-2">Prix affiché</th>
                      <th className="px-4 py-2">Prix ajusté</th>
                      <th className="px-4 py-2">Jours en ligne</th>
                      <th className="px-4 py-2">Statut</th>
                      <th className="px-4 py-2">Région</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparables.slice(0, 12).map((c) => (
                      <tr key={c.listing.id} className="border-t border-sand">
                        <td className="whitespace-nowrap px-4 py-2">
                          {c.listing.year} · {formatKm(c.listing.mileage)}
                          <span className="block text-xs text-muted">{FUEL_LABELS[c.listing.fuel] ?? c.listing.fuel}</span>
                        </td>
                        <td className="px-4 py-2">{formatEur(c.listing.listedPrice)}</td>
                        <td className="px-4 py-2 text-muted">{formatEur(Math.round(c.adjustedPrice / 100) * 100)}</td>
                        <td className="px-4 py-2">{c.daysOnline}</td>
                        <td className="px-4 py-2">{c.sold ? <span className="text-sage">Vendue</span> : <span className="text-muted">En ligne</span>}</td>
                        <td className="px-4 py-2 text-muted">{c.listing.region ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form action={saveEstimation} className="flex flex-wrap items-center justify-end gap-3">
                {Object.entries(sp).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
                {params.make && !sp.vehicle && <input type="hidden" name="vehicle" value={`${params.make}|${params.model}`} />}
                {params.trim && !sp.trim && <input type="hidden" name="trim" value={params.trim} />}
                <Link href="/admin/estimation" className="btn-ghost">
                  Nouvelle estimation
                </Link>
                <button className="btn-brass">Enregistrer et ajouter au stock</button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
