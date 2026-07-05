// Supabase client untuk Client Components ("use client").
// Tidak menyentuh next/headers, jadi aman di-bundle ke browser.

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client untuk Client Components. */
export function createBrowserClient() {
  return _createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
