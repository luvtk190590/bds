import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Dùng globalThis để singleton tồn tại qua Next.js HMR,
  // tránh tạo nhiều client → xung đột Web Locks (AbortError: steal)
  if (globalThis.__supabase_client) return globalThis.__supabase_client;

  globalThis.__supabase_client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return globalThis.__supabase_client;
}
