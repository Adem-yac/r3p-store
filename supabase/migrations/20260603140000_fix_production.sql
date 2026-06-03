
-- Fix admin login: user must read their own role row after sign-in
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Promo usage after order
CREATE OR REPLACE FUNCTION public.increment_promo_usage(promo_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.promo_codes
  SET used_count = used_count + 1
  WHERE code = promo_code
    AND is_active = true
    AND expires_at > now()
    AND (max_uses IS NULL OR used_count < max_uses);
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_promo_usage(text) TO anon, authenticated;

-- Admins can delete orders
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders" ON public.orders
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed catalog when empty (required for https://r3p-store.vercel.app)
INSERT INTO public.products (name, price, old_price, category, description, colors, sizes, images, is_promo, is_active)
SELECT * FROM (VALUES
  ('R3P Hoodie Noir', 3200, NULL::integer, 'Hoodies', 'Hoodie en coton épais, coupe oversize.', ARRAY['#0a0a0a', '#ffffff', '#8B0000']::text[], ARRAY['S','M','L','XL','XXL']::text[], ARRAY[]::text[], false, true),
  ('R3P Hoodie Gris', 3200, 3800, 'Hoodies', 'Hoodie Gris chiné, pochette kangourou.', ARRAY['#808080', '#0a0a0a']::text[], ARRAY['S','M','L','XL','XXL']::text[], ARRAY[]::text[], true, true),
  ('R3P Hoodie Rouge', 3400, NULL::integer, 'Hoodies', 'Hoodie rouge flash, broderie R3P.', ARRAY['#CC0000', '#0a0a0a']::text[], ARRAY['M','L','XL']::text[], ARRAY[]::text[], false, true),
  ('R3P Cargo Pants Noir', 2800, NULL::integer, 'Pantalons', 'Cargo ample, 6 poches.', ARRAY['#0a0a0a', '#2F4F2F']::text[], ARRAY['S','M','L','XL']::text[], ARRAY[]::text[], false, true),
  ('R3P Sweatpants Gris', 2400, 2900, 'Pantalons', 'Sweatpants ajustables, molleton bio.', ARRAY['#808080', '#0a0a0a']::text[], ARRAY['S','M','L','XL','XXL']::text[], ARRAY[]::text[], true, true),
  ('R3P T-Shirt Logo', 1800, NULL::integer, 'T-Shirts', 'T-shirt coton peigné, logo R3P.', ARRAY['#ffffff', '#0a0a0a', '#CC0000']::text[], ARRAY['S','M','L','XL','XXL']::text[], ARRAY[]::text[], false, true),
  ('R3P T-Shirt Signature', 2000, NULL::integer, 'T-Shirts', 'T-shirt manches longues, signature R3P dos.', ARRAY['#0a0a0a', '#ffffff']::text[], ARRAY['M','L','XL']::text[], ARRAY[]::text[], false, true),
  ('R3P Varsity Jacket', 5200, 6500, 'Vestes', 'Varsity en laine, manches cuir.', ARRAY['#0a0a0a', '#8B0000']::text[], ARRAY['M','L','XL']::text[], ARRAY[]::text[], true, true),
  ('R3P Bomber Noir', 4600, NULL::integer, 'Vestes', 'Bomber satin, col côtelé.', ARRAY['#0a0a0a', '#2F4F2F']::text[], ARRAY['S','M','L','XL','XXL']::text[], ARRAY[]::text[], false, true)
) AS v(name, price, old_price, category, description, colors, sizes, images, is_promo, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.products LIMIT 1);
