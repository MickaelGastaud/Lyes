/**
 * Lancé à chaque déploiement : charge les données de démonstration
 * seulement si la base est vide (premier déploiement). Ne touche jamais à une base déjà remplie.
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const [listings, vehicles] = await Promise.all([db.marketListing.count(), db.vehicle.count()]);
  if (listings > 0 || vehicles > 0) {
    console.log("Base déjà remplie : données de démonstration non rechargées.");
    return;
  }
  console.log("Base vide : chargement des données de démonstration…");
  execSync("tsx prisma/seed.ts", { stdio: "inherit" });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
