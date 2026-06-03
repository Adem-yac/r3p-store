
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

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
  INSERT INTO public.products (name, price, old_price, category, description, colors, sizes, images, is_promo, is_active) VALUES
    ('R3P Hoodie Noir', 3200, NULL, 'Hoodies', 'Hoodie en coton épais, coupe oversize.', ARRAY['#0a0a0a', '#ffffff', '#8B0000'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], false, true),
    ('R3P Hoodie Gris', 3200, 3800, 'Hoodies', 'Hoodie Gris chiné, pochette kangourou.', ARRAY['#808080', '#0a0a0a'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], true, true),
    ('R3P Hoodie Rouge', 3400, NULL, 'Hoodies', 'Hoodie rouge flash, broderie R3P.', ARRAY['#CC0000', '#0a0a0a'], ARRAY['M','L','XL'], ARRAY[]::text[], false, true),
    ('R3P Cargo Pants Noir', 2800, NULL, 'Pantalons', 'Cargo ample, 6 poches.', ARRAY['#0a0a0a', '#2F4F2F'], ARRAY['S','M','L','XL'], ARRAY[]::text[], false, true),
    ('R3P Sweatpants Gris', 2400, 2900, 'Pantalons', 'Sweatpants ajustables, molleton bio.', ARRAY['#808080', '#0a0a0a'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], true, true),
    ('R3P T-Shirt Logo', 1800, NULL, 'T-Shirts', 'T-shirt coton peigné, logo R3P.', ARRAY['#ffffff', '#0a0a0a', '#CC0000'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], false, true),
    ('R3P T-Shirt Signature', 2000, NULL, 'T-Shirts', 'T-shirt manches longues, signature R3P dos.', ARRAY['#0a0a0a', '#ffffff'], ARRAY['M','L','XL'], ARRAY[]::text[], false, true),
    ('R3P Varsity Jacket', 5200, 6500, 'Vestes', 'Varsity en laine, manches cuir.', ARRAY['#0a0a0a', '#8B0000'], ARRAY['M','L','XL'], ARRAY[]::text[], true, true),
    ('R3P Bomber Noir', 4600, NULL, 'Vestes', 'Bomber satin, col côtelé.', ARRAY['#0a0a0a', '#2F4F2F'], ARRAY['S','M','L','XL','XXL'], ARRAY[]::text[], false, true);
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
