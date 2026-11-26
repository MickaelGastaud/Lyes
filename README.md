# Confiauto — plateforme d'achat-vente de voitures d'occasion premium

Application SaaS (Next.js) qui répond au [cahier des charges](./cahier-des-charges.pdf) :

1. **Estimer** la valeur de vente réelle d'une voiture sur le marché français, **selon le délai de vente** (30, 45, 60, 90 jours), et en déduire la **marge nette**, y compris pour un achat à l'étranger.
2. **Gérer le stock**, de l'estimation à la vente.
3. **Vendre en confiance** aux particuliers : recherche en langage libre, fiches transparentes (points de contrôle, travaux), demandes d'essai ou de réservation.

> « Confiauto » est un nom provisoire, modifiable en un seul endroit : `src/lib/config.ts`.

## Démarrer en local

Prérequis : Node.js 20 ou plus, et une base PostgreSQL. Le plus simple : réutiliser la base créée sur Vercel (copier son adresse depuis Vercel → Settings → Environment Variables dans `DATABASE_URL`).

```bash
npm install
```

```bash
cp .env.example .env
```

```bash
npm run db:push && npm run db:seed
```

```bash
npm run dev
```

- Site client : http://localhost:3000
- Back-office : http://localhost:3000/admin (identifiant `admin`, mot de passe `confiauto` en local)
- Plaques de démo pour l'estimation : `AB-123-CD`, `EF-456-GH`, `IJ-789-KL`, `MN-012-OP`

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Lance l'application en mode développement |
| `npm test` | Lance les tests automatiques (calculs d'estimation et recherche) |
| `npm run lint` | Vérifie la qualité du code |
| `npm run build` | Construit la version de production |
| `npm run db:push` | Applique les migrations (crée ou met à jour les tables) |
| `npm run db:seed` | Efface et recharge les données de démonstration |

## Comment ça marche (en bref)

Une analogie pour se repérer : **un garage avec un showroom.**

- Le **showroom** (`src/app/(site)`) est ouvert à tous : on y cherche et on découvre les voitures.
- L'**atelier** (`src/app/admin`) est fermé par un digicode (`src/middleware.ts`) : on y estime, achète, prépare et met en vente.
- Le **cerveau de l'expert** (`src/lib/estimation`) est du code pur, sans écran ni base de données, testé automatiquement.

### Le moteur d'estimation

Il raisonne comme un expert qui regarde les petites annonces :

1. **Comparables** (`comparables.ts`) : il retient les annonces du même modèle, d'âge et de kilométrage proches. Il ramène leur prix aux caractéristiques de la voiture estimée (≈ 10 % par an, 2,5 % par 10 000 km) et donne plus de poids aux plus ressemblantes.
2. **Prix de référence** : la médiane pondérée de ces prix ajustés.
3. **Courbe prix / délai** (`pricing.ts`) : à partir des annonces retirées (considérées comme vendues), il apprend la relation « plus c'est cher, plus c'est long ». S'il y a moins de 6 ventes, il utilise un modèle par défaut.
4. **Marge nette** (`margin.ts`) : prix de vente − achat − remise en état − frais d'import − garantie − coût de stock par jour − TVA sur marge.

Il en sort, pour chaque délai, un prix conseillé, une fourchette, une marge, et la recommandation du délai le plus rentable. Chaque estimation enregistrée est conservée, pour comparer plus tard l'estimé et le prix réellement obtenu (tableau de bord).

### Arborescence

```
prisma/
  schema.prisma        Modèle de données (annonces, voitures, estimations, demandes)
  seed.ts              Données de démonstration (fictives)
src/
  app/(site)/          Site client : accueil, recherche, fiche véhicule
  app/admin/           Back-office : tableau de bord, estimation, stock
  components/          Éléments visuels réutilisables
  lib/estimation/      Moteur d'estimation + tests
  lib/search/          Recherche en langage libre + tests
  lib/identification.ts  Identification par plaque (démo, API à brancher)
  lib/config.ts        Nom, coûts par défaut, points de contrôle
  middleware.ts        Protection du back-office
```

## Ce qui est en mode démo (à brancher)

| Élément | État actuel | Étape suivante |
| --- | --- | --- |
| Données de marché | ~1 500 annonces fictives générées | Fournisseur de données sous licence |
| Identification par plaque | 4 plaques de démo | API d'immatriculation (plaque / VIN) |
| Recherche libre | Règles en français (budget, énergie, carrosserie, marque…) | Modèle d'IA pour les phrases plus libres |
| Photos | Silhouette colorée | Envoi de photos (stockage objet) |
| Accès admin | Identifiant + mot de passe unique | Comptes avec rôles (V2) |

## Mise en ligne sur Vercel

Le projet est prêt pour Vercel : à chaque déploiement, le script `vercel-build` met à jour les tables (`prisma migrate deploy`), charge les données de démo si la base est vide, puis construit le site.

1. Sur [vercel.com](https://vercel.com), **Add New → Project**, puis importer le dépôt GitHub `Lyes`.
2. Dans le projet, onglet **Storage → Create Database** : choisir une base PostgreSQL (Neon, Prisma Postgres ou Supabase) et la relier au projet. Ses variables de connexion sont ajoutées automatiquement, quel que soit leur nom.
3. **Settings → Environment Variables** : ajouter `ADMIN_PASSWORD` (et `ADMIN_USER` si besoin). Sans mot de passe, le back-office reste fermé.
4. **Deployments → Redeploy**. Le site est en ligne ; chaque nouveau `git push` le met à jour tout seul.
