# Déploiement Vercel — r3p-store

## Variables d'environnement (obligatoire)

Dans [Vercel → r3p-store → Settings → Environment Variables](https://vercel.com), ajoutez pour **Production**, **Preview** et **Development** :

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | `https://cjonwneuqwcyoklezixt.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé **anon** du projet (Dashboard Supabase → Settings → API) |
| `VITE_SUPABASE_PROJECT_ID` | `cjonwneuqwcyoklezixt` |

> Ne pas utiliser l’ancien projet `rtibvmjhxyduhibrxscm`.

## Supabase Auth (admin)

Dashboard Supabase → **Authentication → URL Configuration** :

- **Site URL** : `https://r3p-store.vercel.app`
- **Redirect URLs** : `https://r3p-store.vercel.app/**`

## Migration SQL

Exécutez `supabase/migrations/20260603120000_fix_api_helpers.sql` dans le SQL Editor Supabase (promos, seed produits).

## Déployer

```bash
git add .
git commit -m "fix: Supabase API + config Vercel"
git push origin main
```

Vercel redéploie automatiquement depuis `Adem-yac/r3p-store`.

## Build local (comme Vercel)

```bash
cp .env.example .env
# Remplir les valeurs, puis :
npm ci
npm run build
```
