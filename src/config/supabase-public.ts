/**
 * Public Supabase project config (anon key is safe to embed in frontend).
 * Env vars override these when set (Vercel / local .env).
 */
export const SUPABASE_PROJECT_REF = "cjonwneuqwcyoklezixt";

export const SUPABASE_URL_DEFAULT = `https://${SUPABASE_PROJECT_REF}.supabase.co`;

/** Legacy anon JWT — public, RLS-protected */
export const SUPABASE_ANON_KEY_DEFAULT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqb253bmV1cXdjeW9rbGV6aXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0Nzk1OTIsImV4cCI6MjA5NjA1NTU5Mn0.bBumM6dehMG7jHOdQqmAAm2PtwObc85d8Z-AkCoMEXw";
