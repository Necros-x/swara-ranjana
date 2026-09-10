import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAdminEnv } from "./env";

export function createAdminClient() {
  const { url, secretKey } = getSupabaseAdminEnv();

  return createSupabaseClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
