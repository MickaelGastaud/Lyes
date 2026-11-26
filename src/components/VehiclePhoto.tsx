import Image from "next/image";
import { CarVisual } from "@/components/CarVisual";
import { isBlobUrl } from "@/lib/photos";

/**
 * Photo d'une voiture, ou silhouette colorée si aucune photo n'est encore disponible.
 * Format des photos : 550 × 463 (proportions conservées).
 */
export function VehiclePhoto({
  photoUrl,
  color,
  label,
  className = "",
  sizes = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw",
  priority = false,
}: {
  photoUrl?: string | null;
  color?: string | null;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!photoUrl) return <CarVisual color={color} label={label} className={`aspect-[550/463] ${className}`} />;
  return (
    <div className={`relative aspect-[550/463] overflow-hidden bg-sand ${className}`}>
      <Image
        src={photoUrl}
        alt={label}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        // Photos du site et de Vercel Blob : optimisées. Autres adresses externes : affichées telles quelles.
        unoptimized={photoUrl.startsWith("http") && !isBlobUrl(photoUrl)}
      />
    </div>
  );
}
