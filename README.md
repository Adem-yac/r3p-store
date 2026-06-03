# R3P Store

Boutique streetwear (Vite + React + Supabase).

## Démarrage local

```bash
npm install
cp .env.example .env
npm run dev
```

## Supabase (une fois)

Exécutez **`supabase/bootstrap.sql`** dans le [SQL Editor](https://supabase.com/dashboard/project/cjonwneuqwcyoklezixt/sql/new) :

- Crée les 9 produits du catalogue
- Corrige la connexion admin
- Active les promos
- **Autorise le CRUD admin** (ajout/modif/suppression produits, commandes, promos, collections en base)

Si le CRUD admin échoue, exécutez aussi `supabase/migrations/20260603160000_admin_crud_rls.sql`.

Compte admin `r3prabah23@r3p.store` / `rabah2002` :

1. Si **email not confirmed** → exécutez **`supabase/confirm-admin.sql`** dans le SQL Editor  
   (ou Dashboard → Users → votre user → **Confirm email**)

2. Ou à la création du user : cocher **Auto Confirm User**

3. Désactiver la confirmation email (optionnel) :  
   **Authentication → Providers → Email** → désactiver **Confirm email**

## Vercel

Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`  
(valeurs dans `.env.example`)

## Admin

https://r3p-store.vercel.app/r3padmin/login — à la première connexion, le catalogue vide est rempli automatiquement.
