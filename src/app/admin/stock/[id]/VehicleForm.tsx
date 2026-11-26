"use client";

import { useActionState } from "react";
import { CHECKPOINTS, VEHICLE_STATUSES } from "@/lib/config";
import { updateVehicle, type UpdateState } from "./actions";

export interface VehicleFormData {
  id: string;
  status: string;
  plate: string | null;
  trim: string | null;
  color: string | null;
  mileage: number;
  description: string | null;
  photoUrl: string | null;
  purchaseCountry: string;
  purchasePrice: number | null;
  importCosts: number;
  reconditioningCosts: number;
  otherCosts: number;
  listPrice: number | null;
  soldPrice: number | null;
  warrantyMonths: number;
  published: boolean;
  checkpoints: string[];
  works: string[];
}

function Field({ label, name, defaultValue, type = "text", suffix }: { label: string; name: string; defaultValue?: string | number | null; type?: string; suffix?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {suffix ? ` (${suffix})` : ""}
      </label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} className="field" />
    </div>
  );
}

export function VehicleForm({ v }: { v: VehicleFormData }) {
  const [state, action, pending] = useActionState<UpdateState, FormData>(updateVehicle, null);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={v.id} />

      <section className="card space-y-4 p-5">
        <h2 className="font-serif text-xl text-night">Étape et publication</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="status">
              Statut
            </label>
            <select id="status" name="status" defaultValue={v.status} className="field">
              {Object.entries(VEHICLE_STATUSES).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={v.published} className="size-4 accent-brass" />
            Publier sur le site client
          </label>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-serif text-xl text-night">Prix et coûts</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Prix d'achat" suffix="€" name="purchasePrice" type="number" defaultValue={v.purchasePrice} />
          <div>
            <label className="label" htmlFor="purchaseCountry">
              Pays d&apos;achat
            </label>
            <select id="purchaseCountry" name="purchaseCountry" defaultValue={v.purchaseCountry} className="field">
              {["FR", "DE", "BE", "ES", "IT", "AUTRE"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <Field label="Frais d'import" suffix="€" name="importCosts" type="number" defaultValue={v.importCosts} />
          <Field label="Remise en état" suffix="€" name="reconditioningCosts" type="number" defaultValue={v.reconditioningCosts} />
          <Field label="Autres frais" suffix="€" name="otherCosts" type="number" defaultValue={v.otherCosts} />
          <Field label="Garantie incluse" suffix="mois" name="warrantyMonths" type="number" defaultValue={v.warrantyMonths} />
          <Field label="Prix affiché" suffix="€" name="listPrice" type="number" defaultValue={v.listPrice} />
          <Field label="Prix de vente réel" suffix="€" name="soldPrice" type="number" defaultValue={v.soldPrice} />
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-serif text-xl text-night">Fiche véhicule</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Plaque" name="plate" defaultValue={v.plate} />
          <Field label="Finition" name="trim" defaultValue={v.trim} />
          <Field label="Couleur" name="color" defaultValue={v.color} />
          <Field label="Kilométrage" name="mileage" type="number" defaultValue={v.mileage} />
        </div>
        <div>
          <label className="label" htmlFor="photoUrl">
            Photo principale (adresse)
          </label>
          <input id="photoUrl" name="photoUrl" defaultValue={v.photoUrl ?? ""} placeholder="/images/vehicules/ma-voiture.jpg ou https://…" className="field" />
          <p className="mt-1 text-xs text-muted">Format conseillé : 1100 × 926 pixels (proportions 550 × 463).</p>
        </div>
        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea id="description" name="description" rows={3} defaultValue={v.description ?? ""} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="works">
            Travaux réalisés (un par ligne)
          </label>
          <textarea id="works" name="works" rows={3} defaultValue={v.works.join("\n")} className="field" />
        </div>
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-serif text-xl text-night">Points de contrôle</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CHECKPOINTS.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="checkpoints" value={c} defaultChecked={v.checkpoints.includes(c)} className="size-4 accent-sage" />
              {c}
            </label>
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-sand backdrop-blur">
        {state && <p className={`text-sm ${state.ok ? "text-sage" : "text-danger"}`}>{state.message}</p>}
        <button disabled={pending} className="btn-primary">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
