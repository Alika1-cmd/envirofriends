import Link from "next/link";

// Shell split-screen bersama untuk login & register.
// Kiri: panel hijau playful dengan sambutan + bubble achievement (sembunyi di
// mobile). Kanan: form + copyright kecil.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const achievements = [
    "📸 Foto sampah, langsung dapat poin",
    "🏆 Naik level setiap hari",
    "🌍 Bantu selamatkan bumi",
  ];

  return (
    <div className="flex min-h-screen">
      {/* Panel kiri — fun & personal (flat hijau + dekorasi kuning). */}
      <div
        className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex"
        style={{ backgroundColor: "#16a34a" }}
      >
        {/* Dekorasi kuning flat. */}
        <span
          aria-hidden
          className="absolute -right-16 -top-16 h-56 w-56 rounded-full"
          style={{ backgroundColor: "#facc15", opacity: 0.25 }}
        />
        <span
          aria-hidden
          className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full"
          style={{ backgroundColor: "#facc15", opacity: 0.2 }}
        />

        <Link
          href="/"
          className="relative font-serif text-2xl font-semibold"
        >
          🌿 EnviroFriends
        </Link>

        <div className="relative max-w-md">
          <h2 className="font-serif text-4xl leading-tight">
            Halo, Pejuang Bumi! 👋
          </h2>

          <div className="mt-8 space-y-3">
            {achievements.map((text) => (
              <div
                key={text}
                className="inline-flex w-full rounded-full bg-white/20 px-5 py-3 text-base font-medium backdrop-blur-sm"
              >
                {text}
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-white/80">
            Sudah 200+ pejuang bergabung hari ini! 🎉
          </p>
        </div>

        <span aria-hidden className="relative" />
      </div>

      {/* Panel kanan — form. */}
      <div className="flex w-full items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {children}
          <p className="mt-10 text-center text-xs text-gray-400">
            © 2026 EnviroFriends · LIDM UGM
          </p>
        </div>
      </div>
    </div>
  );
}
