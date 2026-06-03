import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY_DEFAULT,
  SUPABASE_URL_DEFAULT,
} from "@/config/supabase-public";
import type { Database } from "./types";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL?.trim() || SUPABASE_URL_DEFAULT;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  SUPABASE_ANON_KEY_DEFAULT;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
