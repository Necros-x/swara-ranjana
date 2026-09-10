import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabasePublicEnv } from "./env";

let browserClient: SupabaseClient<Database> | undefined;

export function createClient() {
  if (browserClient) return browserClient;

  const { url, publicKey } = getSupabasePublicEnv();
  browserClient = createBrowserClient<Database>(url, publicKey);

  return browserClient;
}
