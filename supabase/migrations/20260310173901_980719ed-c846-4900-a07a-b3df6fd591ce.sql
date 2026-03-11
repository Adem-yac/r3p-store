
-- Table to track page views
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text,
  referrer text,
  user_agent text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert page views (anonymous tracking)
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT TO public
WITH CHECK (true);

-- Only admins can read page views
CREATE POLICY "Admins can read page views"
ON public.page_views FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
