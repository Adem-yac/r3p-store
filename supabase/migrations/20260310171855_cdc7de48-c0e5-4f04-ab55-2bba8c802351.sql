
-- The "Anyone can create orders" policy with WITH CHECK (true) is intentional
-- since this is a public e-commerce store where anyone can place orders.
-- We add a check to ensure required fields are provided.
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    customer_name IS NOT NULL AND customer_name <> '' AND
    customer_phone IS NOT NULL AND customer_phone <> '' AND
    wilaya IS NOT NULL AND wilaya <> ''
  );
