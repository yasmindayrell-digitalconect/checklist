// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,              // URL pública
  process.env.SUPABASE_SERVICE_ROLE_KEY!,            // 👈 service role (server-only)
  { auth: { persistSession: false, autoRefreshToken: false } }
);