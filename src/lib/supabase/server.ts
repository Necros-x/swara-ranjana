import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publicKey } = getSupabasePublicEnv();

  return createServerClient<Database>(url, publicKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, _headers) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. Session-refresh
          // middleware can take over this job when auth is wired in Phase 2.
        }
      },
    },
  });
}
