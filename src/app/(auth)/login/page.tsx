"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient());

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : error.message,
      );
      setLoading(false);
      return;
    }

    // Hormati ?redirect dari middleware bila ada.
    const redirect =
      new URLSearchParams(window.location.search).get("redirect") ||
      "/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-serif text-4xl text-gray-900">Masuk</h1>
      <p className="mt-2 text-gray-500">
        Senang melihatmu kembali, pejuang bumi! 🌱
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="kamu@email.com"
          autoComplete="email"
        />
        <Field
          label="Kata Sandi"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full py-3 font-medium text-black transition-[filter] hover:brightness-95 disabled:opacity-60"
          style={{ backgroundColor: "#facc15" }}
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-green-600 hover:underline">
          Daftar gratis
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500"
      />
    </label>
  );
}
