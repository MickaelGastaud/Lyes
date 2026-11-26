import { PrismaClient } from "@prisma/client";

/**
 * Connexion unique à la base de données.
 * En développement, Next.js recharge le code souvent : on réutilise la même connexion
 * au lieu d'en ouvrir une nouvelle à chaque rechargement.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Selon le fournisseur de base relié à Vercel, l'adresse n'a pas le même nom.
const datasourceUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;

export const db = globalForPrisma.prisma ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
