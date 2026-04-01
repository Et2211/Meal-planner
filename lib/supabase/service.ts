import { createClient } from "@supabase/supabase-js";

/**
 * Service role client — bypasses RLS. Server-side only.
 * Used inside `use cache` functions where the cookie-based client isn't available.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
