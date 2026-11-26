-- Photo principale de chaque voiture
ALTER TABLE "Vehicle" ADD COLUMN "photoUrl" TEXT;

-- Photos des voitures de démonstration déjà en ligne (et couleurs corrigées pour correspondre aux photos)
UPDATE "Vehicle" SET "photoUrl" = '/images/vehicules/peugeot-3008-fd930pr.jpg', "color" = 'Gris Platinium' WHERE "plate" = 'FD-930-PR';
UPDATE "Vehicle" SET "photoUrl" = '/images/vehicules/skoda-octavia-ew554jd.jpg' WHERE "plate" = 'EW-554-JD';
UPDATE "Vehicle" SET "photoUrl" = '/images/vehicules/tesla-model-3-ga205ts.jpg' WHERE "plate" = 'GA-205-TS';
UPDATE "Vehicle" SET "photoUrl" = '/images/vehicules/toyota-rav4-gh482kl.jpg', "color" = 'Blanc nacré, toit noir' WHERE "plate" = 'GH-482-KL';
