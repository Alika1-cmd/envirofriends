"use client";

import { useEffect, useMemo, useState } from "react";
import type { EcoFact } from "@/lib/content";
import EcoCard from "@/components/EcoCard";
import BottomNav from "@/components/BottomNav";

const GREEN = "#16a34a";
const DECOR = "#15803d";
const YELLOW = "#facc15";

export default function EcoFactsPage() {
  const [facts, setFacts] = useState<EcoFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active, setActive] = useState<string>("Semua");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/ecofacts");
        if (!res.ok) throw new Error("gagal memuat");
        const data = await res.json();
        if (alive) setFacts(data.facts ?? []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Filter dibangun dari kategori yang benar-benar muncul hari ini.
  const filters = useMemo(() => {
    const cats = Array.from(new Set(facts.map((f) => f.category)));
    return ["Semua", ...cats];
  }, [facts]);

  const shown = useMemo(
    () =>
      active === "Semua" ? facts : facts.filter((f) => f.category === active),
    [active, facts],
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header. */}
      <section
        className="relative overflow-hidden px-6 pb-8 pt-8 text-white"
        style={{ backgroundColor: GREEN }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full"
          style={{ backgroundColor: DECOR }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full"
          style={{ backgroundColor: DECOR, opacity: 0.6 }}
        />
        <div className="relative mx-auto max-w-2xl">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold text-gray-900"
            style={{ backgroundColor: YELLOW }}
          >
            FAKTA HARI INI ✨
          </span>
          <h1 className="mt-3 font-serif text-3xl">EcoFacts 🌱</h1>
          <p className="mt-1 text-white/80">
            Fakta seru tentang menjaga bumi. Yuk belajar sambil main!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl">🤖</div>
            <p className="mt-4 text-gray-600">
              Robot lagi mikirin fakta seru buat kamu...
            </p>
          </div>
        ) : error ? (
          <p className="mt-10 text-center text-gray-500">
            Yah, faktanya lagi ngumpet. Coba buka lagi sebentar ya!
          </p>
        ) : (
          <>
            {/* Filter kategori. */}
            <div className="flex flex-wrap gap-2">
              {filters.map((cat) => {
                const isActive = active === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActive(cat)}
                    className="rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: GREEN, color: "#fff" }
                        : { backgroundColor: "#fff", color: "#4b5563" }
                    }
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Grid kartu. */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {shown.map((fact) => (
                <EcoCard key={fact.id} fact={fact} />
              ))}
            </div>

            {shown.length === 0 && (
              <p className="mt-10 text-center text-gray-500">
                Belum ada fakta di kategori ini.
              </p>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
