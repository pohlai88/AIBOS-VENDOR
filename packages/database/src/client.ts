import { createClient } from "@supabase/supabase-js";
import type { Database } from "./schema";

export function createSupabaseClient(url: string, key: string) {
  return createClient<Database>(url, key);
}

export function createSupabaseServerClient(
  url: string,
  key: string,
  accessToken?: string
) {
  return createClient<Database>(url, key, {
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
}

