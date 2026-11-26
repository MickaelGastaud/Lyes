import Link from "next/link";
import { VehiclePhoto } from "@/components/VehiclePhoto";
import { formatEur, formatKm, FUEL_LABELS, GEARBOX_LABELS } from "@/lib/format";

export interface VehicleCardData {
  id: string;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  mileage: number;
  fuel: string;
  gearbox: string;
  color: string | null;
  photoUrl: string | null;
  listPrice: number | null;
  warrantyMonths: number;
}

export function VehicleCard({ v }: { v: VehicleCardData }) {
  return (
    <Link href={`/voitures/${v.id}`} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <VehiclePhoto photoUrl={v.photoUrl} color={v.color} label={`${v.make} ${v.model} ${v.trim ?? ""}, ${v.year}`} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-serif text-xl text-night">
            {v.make} {v.model}
          </h3>
          {v.trim && <p className="text-sm text-muted">{v.trim}</p>}
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          <li>{v.year}</li>
          <li>{formatKm(v.mileage)}</li>
          <li>{FUEL_LABELS[v.fuel] ?? v.fuel}</li>
          <li>{GEARBOX_LABELS[v.gearbox] ?? v.gearbox}</li>
        </ul>
        <div className="mt-auto flex items-end justify-between border-t border-sand pt-3">
          <span className="text-xs font-medium text-sage">✓ Contrôlée · garantie {v.warrantyMonths} mois</span>
          <span className="text-lg font-semibold text-night">{formatEur(v.listPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
