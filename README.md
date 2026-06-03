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

Compte admin : **Authentication → Users** → Add user  
- Email : `r3prabah23@r3p.store`  
- Mot de passe : `rabah2002`  
- Cocher **Auto Confirm User**  

Puis SQL (remplacer l’UUID) :

```sql
INSERT INTO public.user_roles (user_id, role) VALUES ('UUID', 'admin');
```

## Vercel

Variables : `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`  
(valeurs dans `.env.example`)

## Admin

https://r3p-store.vercel.app/r3padmin/login — à la première connexion, le catalogue vide est rempli automatiquement.
