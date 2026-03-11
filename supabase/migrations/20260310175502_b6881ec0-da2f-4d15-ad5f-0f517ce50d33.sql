
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections" ON public.collections FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.collections (name, slug, display_order) VALUES
  ('Hoodies', 'hoodies', 1),
  ('Pantalons', 'pantalons', 2),
  ('T-Shirts', 't-shirts', 3),
  ('Vestes', 'vestes', 4);
