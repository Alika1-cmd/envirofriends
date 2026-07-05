"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

export default function RegisterPage() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient());

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Jika email confirmation aktif, belum ada session → minta cek email.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setInfo(
        "Akun dibuat! Cek email kamu untuk konfirmasi, lalu masuk untuk mulai.",
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl text-gray-900">Daftar</h1>
      <p className="mt-2 text-gray-500">
        Mulai perjalananmu jadi pejuang bumi! 🌱
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          placeholder="namamu"
          autoComplete="username"
        />
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
          placeholder="minimal 6 karakter"
          autoComplete="new-password"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full py-3 font-medium text-black transition-[filter] hover:brightness-95 disabled:opacity-60"
          style={{ backgroundColor: "#facc15" }}
        >
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-green-600 hover:underline">
          Masuk di sini
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
        minLength={type === "password" ? 6 : undefined}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500"
      />
    </label>
  );
}
