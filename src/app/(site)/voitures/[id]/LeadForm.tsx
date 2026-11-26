"use client";

import { useActionState } from "react";
import { createLead, type LeadState } from "./actions";

export function LeadForm({ vehicleId }: { vehicleId: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(createLead, null);

  if (state?.ok) {
    return (
      <div className="rounded-xl bg-sage/10 p-4 text-sm text-sage">
        Merci ! Votre demande est bien reçue. Un conseiller vous recontacte sous 24 h ouvrées.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div>
        <label className="label" htmlFor="type">
          Votre demande
        </label>
        <select id="type" name="type" className="field" defaultValue="ESSAI">
          <option value="ESSAI">Réserver un essai</option>
          <option value="RESERVATION">Réserver cette voiture</option>
          <option value="QUESTION">Poser une question</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="name">
          Nom
        </label>
        <input id="name" name="name" required className="field" autoComplete="name" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Téléphone
          </label>
          <input id="phone" name="phone" className="field" autoComplete="tel" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="message">
          Message (facultatif)
        </label>
        <textarea id="message" name="message" rows={3} className="field" />
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-brass w-full">
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
