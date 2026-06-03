/**
 * Ensures Vite/Supabase env vars exist before production build (Vercel, CI).
 * Set these in Vercel → Project → Settings → Environment Variables.
 */
const required = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const missing = required.filter((key) => !process.env[key]?.trim());

if (missing.length > 0) {
  console.error("\n❌ Build aborted: missing environment variables:\n");
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error(
    "\nAdd them in Vercel: Project r3p-store → Settings → Environment Variables\n" +
      "   VITE_SUPABASE_URL=https://cjonwneuqwcyoklezixt.supabase.co\n" +
      "   VITE_SUPABASE_PUBLISHABLE_KEY=<your anon key from Supabase dashboard>\n"
  );
  process.exit(1);
}

if (!process.env.VITE_SUPABASE_URL.includes("cjonwneuqwcyoklezixt")) {
  console.warn(
    "⚠️  VITE_SUPABASE_URL does not match project cjonwneuqwcyoklezixt — check Vercel env vars."
  );
}

console.log("✓ Supabase environment variables OK");
