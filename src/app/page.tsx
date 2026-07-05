import Link from "next/link";

const GREEN = "#15503a";
const YELLOW = "#facc15";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <section
        className="flex min-h-screen flex-col justify-end px-6 pb-16 text-white"
        style={{ backgroundColor: GREEN }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-green-300">
          Edukasi Lingkungan untuk Anak
        </span>
        <h1 className="mt-3 font-serif text-4xl leading-tight">
          Masa Depan Bumi Ada di Tanganmu
        </h1>
        <p className="mt-3 max-w-md text-white/80">
          Selesaikan challenge harian, kumpulkan poin, dan jadi Pejuang Bumi
          bareng EnviroFriends.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/register"
            className="rounded-full px-6 py-3 font-semibold text-gray-900"
            style={{ backgroundColor: YELLOW }}
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white"
          >
            Masuk
          </Link>
        </div>
      </section>
    </main>
  );
}
