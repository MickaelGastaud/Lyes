import { PrismaClient } from "@prisma/client";

/**
 * Connexion unique à la base de données.
 * En développement, Next.js recharge le code souvent : on réutilise la même connexion
 * au lieu d'en ouvrir une nouvelle à chaque rechargement.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
