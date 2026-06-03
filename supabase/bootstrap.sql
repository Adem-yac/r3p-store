-- Collez tout dans : https://supabase.com/dashboard/project/cjonwneuqwcyoklezixt/sql/new → Run

-- Admin : lire son propre rôle
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Catalogue (9 produits, IDs fixes = site)
CREATE OR REPLACE FUNCTION public.seed_products_if_empty()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
    RETURN;
  END IF;
  INSERT INTO public.products (id, name, price, old_price, category, description, colors, sizes, images, is_promo, is_active) VALUES
    ('a1000001-0001-4000-8000-000000000001', 'R3P Hoodie Noir', 3200, NULL, 'Hoodies', 'Hoodie en coton épais, coupe oversize.', ARRAY['#0a0a0a', '#ffffff', '#8B0000'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], false, true),
    ('a1000001-0001-4000-8000-000000000002', 'R3P Hoodie Gris', 3200, 3800, 'Hoodies', 'Hoodie Gris chiné, pochette kangourou.', ARRAY['#808080', '#0a0a0a'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], true, true),
    ('a1000001-0001-4000-8000-000000000003', 'R3P Hoodie Rouge', 3400, NULL, 'Hoodies', 'Hoodie rouge flash, broderie R3P.', ARRAY['#CC0000', '#0a0a0a'], ARRAY['M','L','XL'], ARRAY[]::text[], false, true),
    ('a1000001-0001-4000-8000-000000000004', 'R3P Cargo Pants Noir', 2800, NULL, 'Pantalons', 'Cargo ample, 6 poches.', ARRAY['#0a0a0a', '#2F4F2F'], ARRAY['S','M','L','XL'], ARRAY[]::text[], false, true),
    ('a1000001-0001-4000-8000-000000000005', 'R3P Sweatpants Gris', 2400, 2900, 'Pantalons', 'Sweatpants ajustables, molleton bio.', ARRAY['#808080', '#0a0a0a'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], true, true),
    ('a1000001-0001-4000-8000-000000000006', 'R3P T-Shirt Logo', 1800, NULL, 'T-Shirts', 'T-shirt coton peigné, logo R3P.', ARRAY['#ffffff', '#0a0a0a', '#CC0000'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], false, true),
    ('a1000001-0001-4000-8000-000000000007', 'R3P T-Shirt Signature', 2000, NULL, 'T-Shirts', 'T-shirt manches longues, signature R3P dos.', ARRAY['#0a0a0a', '#ffffff'], ARRAY['M','L','XL'], ARRAY[]::text[], false, true),
    ('a1000001-0001-4000-8000-000000000008', 'R3P Varsity Jacket', 5200, 6500, 'Vestes', 'Varsity en laine, manches cuir.', ARRAY['#0a0a0a', '#8B0000'], ARRAY['M','L','XL'], ARRAY[]::text[], true, true),
    ('a1000001-0001-4000-8000-000000000009', 'R3P Bomber Noir', 4600, NULL, 'Vestes', 'Bomber satin, col côtelé.', ARRAY['#0a0a0a', '#2F4F2F'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], false, true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.seed_products_if_empty() TO anon, authenticated;
SELECT public.seed_products_if_empty();

CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.promo_codes SET used_count = used_count + 1
  WHERE code = promo_code AND is_active = true AND expires_at > now()
    AND (max_uses IS NULL OR used_count < max_uses);
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_promo_usage(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- CRUD admin : WITH CHECK sur UPDATE/INSERT
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Admins can manage promo codes" ON public.promo_codes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all promo codes" ON public.promo_codes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Email non confirmé ? Exécutez supabase/confirm-admin.sql
-- Ou Dashboard → Authentication → Users → r3prabah23@r3p.store → Confirm email
