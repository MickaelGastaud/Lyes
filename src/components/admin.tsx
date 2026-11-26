import { VEHICLE_STATUSES, type VehicleStatus } from "@/lib/config";

const STATUS_STYLE: Record<VehicleStatus, string> = {
  ESTIMATED: "bg-sand text-ink",
  PURCHASED: "bg-night/10 text-night",
  RECONDITIONING: "bg-brass/15 text-brass-dark",
  FOR_SALE: "bg-sage/15 text-sage",
  SOLD: "bg-night text-white",
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status in VEHICLE_STATUSES ? status : "ESTIMATED") as VehicleStatus;
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[s]}`}>{VEHICLE_STATUSES[s]}</span>;
}

export function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-night">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-serif text-3xl text-night">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
