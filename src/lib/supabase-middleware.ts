// Supabase client untuk middleware (Edge runtime). Membaca cookie dari
// NextRequest dan menulis balik ke NextResponse agar session yang ter-refresh
// terkirim ke browser. Tidak memakai next/headers, jadi aman di edge.
//
// next/server di-import sebagai TYPE saja (di-erase saat compile) — tidak ada
// runtime value dari next/headers di sini.

import {
  createServerClient as _createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });
}
