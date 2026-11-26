import { formatEur } from "@/lib/format";
import type { HorizonEstimate } from "@/lib/estimation/types";

/**
 * Courbe prix / délai : pour chaque délai de vente, le prix probable (point)
 * et sa fourchette basse / haute (bande).
 */
export function PriceDelayChart({ horizons, best }: { horizons: HorizonEstimate[]; best?: number | null }) {
  const W = 640, H = 260, L = 72, R = 24, T = 24, B = 40;
  const days = horizons.map((h) => h.days);
  const lo = Math.min(...horizons.map((h) => h.low));
  const hi = Math.max(...horizons.map((h) => h.high));
  const pad = (hi - lo) * 0.15 || 500;
  const yMin = lo - pad, yMax = hi + pad;
  const x = (d: number) => L + ((d - days[0]) / (days[days.length - 1] - days[0] || 1)) * (W - L - R);
  const y = (p: number) => T + (1 - (p - yMin) / (yMax - yMin)) * (H - T - B);

  const band =
    horizons.map((h, i) => `${i ? "L" : "M"}${x(h.days)} ${y(h.high)}`).join(" ") +
    " " +
    [...horizons].reverse().map((h) => `L${x(h.days)} ${y(h.low)}`).join(" ") +
    " Z";
  const line = horizons.map((h, i) => `${i ? "L" : "M"}${x(h.days)} ${y(h.price)}`).join(" ");
  const ticks = Array.from({ length: 4 }, (_, i) => yMin + ((i + 0.5) * (yMax - yMin)) / 4);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Prix de vente estimé selon le délai de vente">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#ebe5d8" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#5b6475">
            {formatEur(Math.round(t / 100) * 100)}
          </text>
        </g>
      ))}
      <path d={band} fill="#a8844f" opacity="0.15" />
      <path d={line} fill="none" stroke="#0f1c2e" strokeWidth="2" />
      {horizons.map((h) => {
        const isBest = h.days === best;
        return (
          <g key={h.days}>
            <circle cx={x(h.days)} cy={y(h.price)} r={isBest ? 7 : 5} fill={isBest ? "#a8844f" : "#0f1c2e"} stroke="#fff" strokeWidth="2" />
            <text x={x(h.days)} y={y(h.price) - 14} textAnchor="middle" fontSize="12" fontWeight={isBest ? 700 : 500} fill="#1b2231">
              {formatEur(h.price)}
            </text>
            <text x={x(h.days)} y={H - 14} textAnchor="middle" fontSize="12" fill="#5b6475">
              {h.days} jours
            </text>
          </g>
        );
      })}
    </svg>
  );
}
