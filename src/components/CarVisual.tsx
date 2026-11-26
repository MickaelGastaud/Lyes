/**
 * Visuel de remplacement en attendant les vraies photos :
 * une silhouette de voiture teintée selon la couleur du véhicule.
 */
const COLOR_MAP: [RegExp, string][] = [
  [/noir/i, "#22252b"],
  [/blanc/i, "#e8e6e1"],
  [/gris|argent|platine|quartz|artense|thunder/i, "#8b9099"],
  [/bleu|navarre|celeste|céleste/i, "#2f4d7a"],
  [/rouge|kings/i, "#9b2c2c"],
  [/orange|valencia/i, "#cf7a2e"],
  [/vert/i, "#3f6b4f"],
];

function tint(color?: string | null) {
  if (!color) return "#6b7280";
  return COLOR_MAP.find(([re]) => re.test(color))?.[1] ?? "#6b7280";
}

export function CarVisual({ color, label, className = "" }: { color?: string | null; label?: string; className?: string }) {
  const fill = tint(color);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-sand/60 to-sand ${className}`}>
      <svg viewBox="0 0 320 150" className="absolute inset-0 m-auto h-full w-full p-6" role="img" aria-label={label ?? "Voiture"}>
        <ellipse cx="160" cy="122" rx="135" ry="7" fill="#000" opacity="0.12" />
        <path d="M18 104 Q18 80 44 74 L96 64 Q122 38 162 36 L204 36 Q236 38 260 64 L292 72 Q306 77 304 104 Z" fill={fill} />
        <path d="M108 66 Q130 46 162 45 L178 45 L178 66 Z M188 45 L204 45 Q228 47 246 66 L188 66 Z" fill="#dfe7ef" opacity="0.85" />
        <rect x="18" y="98" width="286" height="6" rx="3" fill="#000" opacity="0.15" />
        {[86, 236].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="106" r="20" fill="#1a1c20" />
            <circle cx={cx} cy="106" r="10" fill="#b9bec6" />
          </g>
        ))}
      </svg>
    </div>
  );
}
