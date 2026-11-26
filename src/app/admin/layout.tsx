import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "Back-office", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/estimation", label: "Estimer une voiture" },
  { href: "/admin/stock", label: "Stock" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="bg-night px-5 py-6 text-white md:min-h-screen">
        <Link href="/admin" className="font-serif text-2xl">
          {BRAND.name}
          <span className="text-brass">.</span>
        </Link>
        <p className="mt-1 text-xs uppercase tracking-widest text-white/50">Back-office</p>
        <nav className="mt-8 flex gap-1 overflow-x-auto md:flex-col">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="mt-8 hidden text-xs text-white/50 hover:text-white md:block">
          ← Voir le site client
        </Link>
      </aside>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">{children}</div>
    </div>
  );
}
