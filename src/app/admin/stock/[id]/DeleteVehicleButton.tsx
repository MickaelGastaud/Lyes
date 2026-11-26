"use client";

import { useFormStatus } from "react-dom";
import { deleteVehicle } from "./actions";

function Submit({ variant }: { variant: "full" | "icon" }) {
  const { pending } = useFormStatus();
  if (variant === "icon") {
    return (
      <button disabled={pending} className="rounded-lg px-2 py-1 text-xs text-muted hover:bg-danger/10 hover:text-danger" title="Supprimer">
        {pending ? "…" : "Supprimer"}
      </button>
    );
  }
  return (
    <button disabled={pending} className="w-full rounded-lg border border-danger/30 px-3 py-2 text-sm text-danger hover:bg-danger/10">
      {pending ? "Suppression…" : "Supprimer ce véhicule"}
    </button>
  );
}

/** Bouton de suppression avec confirmation (dans la liste du stock et sur la fiche). */
export function DeleteVehicleButton({
  id,
  label,
  sold,
  variant = "icon",
}: {
  id: string;
  label: string;
  sold: boolean;
  variant?: "full" | "icon";
}) {
  const question = sold
    ? `${label} est vendue : la supprimer la retire aussi des statistiques du tableau de bord.\n\nSupprimer définitivement ?`
    : `Supprimer définitivement ${label} ? Cette action est irréversible.`;

  return (
    <form action={deleteVehicle} onSubmit={(e) => !window.confirm(question) && e.preventDefault()}>
      <input type="hidden" name="id" value={id} />
      <Submit variant={variant} />
    </form>
  );
}
