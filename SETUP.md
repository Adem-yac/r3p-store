# Mise en service R3P Store (Vercel + Supabase)

## 1. SQL obligatoire (boutique vide sinon)

Ouvrez le [SQL Editor Supabase](https://supabase.com/dashboard/project/cjonwneuqwcyoklezixt/sql/new), collez et exécutez **tout** le fichier :

`supabase/migrations/20260603140000_fix_production.sql`

Cela ajoute les 9 produits, corrige la connexion admin et les codes promo.

## 2. Créer le compte administrateur

### Option A — Dashboard Supabase

1. **Authentication → Users → Add user** (email + mot de passe, confirmé)
2. Copiez l’**UUID** de l’utilisateur
3. SQL Editor :

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('COLLER-UUID-ICI', 'admin')
ON CONFLICT DO NOTHING;
```

### Option B — Edge Function `create-admin`

Après déploiement de la fonction (`supabase functions deploy create-admin`) :

```bash
curl -X POST "https://cjonwneuqwcyoklezixt.supabase.co/functions/v1/create-admin" ^
  -H "Authorization: Bearer VOTRE_CLE_ANON" ^
  -H "Content-Type: application/json" ^
  -d "{\"action\":\"create-admin\",\"email\":\"votre@email.com\",\"password\":\"VotreMotDePasse\"}"
```

## 3. URLs Auth Supabase

**Authentication → URL Configuration**

| Champ | Valeur |
|-------|--------|
| Site URL | `https://r3p-store.vercel.app` |
| Redirect URLs | `https://r3p-store.vercel.app/**` |

## 4. Vercel — variables d’environnement

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://cjonwneuqwcyoklezixt.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé **anon** (Settings → API) |
| `VITE_SUPABASE_PROJECT_ID` | `cjonwneuqwcyoklezixt` |

Puis **Redeploy** le projet.

## 5. Connexion admin

- URL : https://r3p-store.vercel.app/r3padmin/login  
- Utilisez l’email/mot de passe créés à l’étape 2 (plus l’ancien login local).
