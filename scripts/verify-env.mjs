/**
 * Warns if Vite env vars are missing; build still succeeds using public defaults.
 */
const hasUrl = Boolean(process.env.VITE_SUPABASE_URL?.trim());
const hasKey = Boolean(process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim());

if (!hasUrl || !hasKey) {
  console.warn(
    "\n⚠️  VITE_SUPABASE_* not set — using built-in defaults for project cjonwneuqwcyoklezixt.\n" +
      "   For production, prefer Vercel → Settings → Environment Variables.\n"
  );
} else if (!process.env.VITE_SUPABASE_URL.includes("cjonwneuqwcyoklezixt")) {
  console.warn(
    "⚠️  VITE_SUPABASE_URL does not match project cjonwneuqwcyoklezixt."
  );
} else {
  console.log("✓ Supabase environment variables OK");
}
