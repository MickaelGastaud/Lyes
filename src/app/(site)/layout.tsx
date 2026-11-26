import Link from "next/link";
import { BRAND } from "@/lib/config";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-night-soft bg-night text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-serif text-2xl tracking-wide">
            {BRAND.name}
            <span className="text-brass">.</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-white/80">
            <Link href="/voitures" className="hover:text-white">
              Nos voitures
            </Link>
            <Link href="/#engagements" className="hidden hover:text-white sm:inline">
              Nos engagements
            </Link>
            <Link href="/#services" className="hidden hover:text-white sm:inline">
              Services
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-sand bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BRAND.name} — achat-vente de voitures d&apos;occasion premium.
          </p>
          <p>Voitures contrôlées · Garantie incluse · Prix transparents</p>
        </div>
      </footer>
    </div>
  );
}
