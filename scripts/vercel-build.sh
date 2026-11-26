#!/bin/sh
# Build Vercel : base de données à jour, données de démo si besoin, puis construction du site.
set -e

# Chaque fournisseur de base (Neon, Prisma Postgres, Supabase…) nomme ses variables différemment :
# on prend la première qui existe.
export DATABASE_URL="${DATABASE_URL:-${POSTGRES_PRISMA_URL:-$POSTGRES_URL}}"
if [ -z "$DATABASE_URL" ]; then
  echo "ERREUR : aucune base de données n'est reliée au projet Vercel (onglet Storage)."
  exit 1
fi
# Les migrations préfèrent une connexion directe (non « poolée ») quand elle existe.
MIGRATE_URL="${DATABASE_URL_UNPOOLED:-${POSTGRES_URL_NON_POOLING:-$DATABASE_URL}}"

prisma generate
DATABASE_URL="$MIGRATE_URL" prisma migrate deploy
tsx prisma/seed-if-empty.ts
next build
