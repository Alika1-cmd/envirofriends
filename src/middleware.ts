// Proteksi route + refresh session Supabase.
// Route terlindungi: /dashboard/*, /challenge/*, /quiz/*, /ecofacts/*.
// Tanpa session → redirect ke /login (CLAUDE.md).

import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase-middleware";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/challenge",
  "/quiz",
  "/ecofacts",
  "/profile",
];

export async function middleware(request: NextRequest) {
  // Response awal — cookie hasil refresh session akan ditulis ke sini.
  const response = NextResponse.next({ request });

  const supabase = createMiddlewareClient(request, response);

  // getUser() memvalidasi token ke server Supabase sekaligus menyegarkan
  // session bila perlu (jangan pakai getSession() di middleware).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Simpan tujuan asal agar bisa kembali setelah login.
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Jalankan di route terlindungi (termasuk sub-path). Aset statis & API
  // dilewati agar tidak menambah latensi.
  matcher: [
    "/dashboard/:path*",
    "/challenge/:path*",
    "/quiz/:path*",
    "/ecofacts/:path*",
    "/profile/:path*",
  ],
};
