import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";

export function createSupabasePublicClient() {
  const { anonKey, url } = getSupabaseBrowserEnv();

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false
    }
  });
}
