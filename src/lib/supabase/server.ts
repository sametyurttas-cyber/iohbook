import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseBrowserEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { anonKey, url } = getSupabaseBrowserEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies. Middleware refreshes sessions.
        }
      }
    }
  });
}
