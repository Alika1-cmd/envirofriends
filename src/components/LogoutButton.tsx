"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

/** Tombol keluar — mengakhiri session Supabase lalu kembali ke landing. */
export default function LogoutButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient());
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        "rounded-full border border-white/40 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
      }
    >
      {loading ? "Keluar…" : "Keluar"}
    </button>
  );
}
