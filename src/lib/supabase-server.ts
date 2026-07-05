// Supabase client untuk Server Components & Route Handlers (App Router).
// Mengandung import next/headers — file ini SERVER-ONLY, jangan diimpor dari
// client component atau middleware.

import "server-only";
import {
  createServerClient as _createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client untuk Server Components & API routes. */
export function createServerClient() {
  const cookieStore = cookies();

  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Di Server Component (read-only) set() bisa melempar — abaikan,
        // middleware yang akan menyegarkan cookie.
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          /* no-op */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          /* no-op */
        }
      },
    },
  });
}
