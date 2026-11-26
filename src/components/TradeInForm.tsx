"use client";

import { useActionState } from "react";
import { createTradeInLead, type TradeInState } from "@/app/(site)/actions";

export function TradeInForm() {
  const [state, action, pending] = useActionState<TradeInState, FormData>(createTradeInLead, null);

  if (state?.ok) {
    return (
      <p className="rounded-xl bg-sage/10 p-4 text-sm text-sage">
        Merci ! Un conseiller étudie votre voiture et vous recontacte sous 48 h ouvrées avec une proposition de reprise.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <div>
          <label className="label" htmlFor="ti-car">
            Votre voiture
          </label>
          <input id="ti-car" name="car" required placeholder="Ex. : Peugeot 308, 2019" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="ti-km">
            Kilométrage
          </label>
          <input id="ti-km" name="mileage" inputMode="numeric" placeholder="85 000" className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ti-name">
          Nom
        </label>
        <input id="ti-name" name="name" required autoComplete="name" className="field" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="ti-email">
            E-mail
          </label>
          <input id="ti-email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="ti-phone">
            Téléphone
          </label>
          <input id="ti-phone" name="phone" autoComplete="tel" className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="ti-msg">
          Précisions (facultatif)
        </label>
        <textarea id="ti-msg" name="message" rows={2} placeholder="État, entretien, options…" className="field" />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-brass w-full">
        {pending ? "Envoi…" : "Demander une proposition de reprise"}
      </button>
    </form>
  );
}
