-- Exécutez dans : https://supabase.com/dashboard/project/cjonwneuqwcyoklezixt/sql/new

-- 1) Confirmer l'email (sinon login impossible)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'r3prabah23@r3p.store';

-- 2) Donner le rôle admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('34e3dde2-5cf1-4e62-8f06-256550f08eae', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Vérification
SELECT u.email, u.email_confirmed_at, ur.role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'r3prabah23@r3p.store';
