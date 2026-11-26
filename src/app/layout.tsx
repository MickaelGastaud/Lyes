import type { Metadata } from "next";
import { BRAND } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${BRAND.name} — voitures d'occasion contrôlées et garanties`, template: `%s · ${BRAND.name}` },
  description: BRAND.tagline,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
