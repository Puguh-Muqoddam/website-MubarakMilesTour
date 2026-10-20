import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

// Klien Supabase Auth di server. Token sesi disimpan di cookie httpOnly oleh @supabase/ssr,
// tidak pernah di localStorage. Dipakai khusus untuk autentikasi pengelola (/admin).
export async function createSupabaseServerClient() {
  const env = getServerEnv();
  const cookieStore = await cookies();
  return createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
            });
          }
        } catch {
          // Dipanggil dari Server Component (cookie read-only): diabaikan; diperbarui pada Server Action.
        }
      },
    },
  });
}
