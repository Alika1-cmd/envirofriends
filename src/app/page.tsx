"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const GREEN = "#16a34a"; // primary
const YELLOW = "#facc15"; // secondary
const DARK = "#14532d"; // hijau gelap
const LIGHT = "#f0fdf4"; // hijau muda
const DECOR = "#15803d"; // hijau lebih gelap untuk lingkaran dekoratif

/** Dua lingkaran dekoratif di pojok (seperti panel register). */
function CornerCircles({
  color = DECOR,
  opacity = 1,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
        style={{ backgroundColor: color, opacity }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full"
        style={{ backgroundColor: color, opacity }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Hooks & helper komponen
// ---------------------------------------------------------------------------

/** True setelah halaman di-scroll melewati `threshold` px. */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * Reveal fade-in-up saat elemen masuk viewport. `delay` dalam ms untuk
 * efek staggered.
 */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${shown ? "animate-fade-up" : "opacity-0"}`}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

/** Angka yang menghitung naik dari 0 → `to` selama 2 detik saat terlihat. */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 2000;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setValue(Math.round(eased * to));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Bagian halaman
// ---------------------------------------------------------------------------

function Navbar() {
  const scrolled = useScrolled();
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow ${
        scrolled ? "shadow-md" : ""
      }`}
      style={{ backgroundColor: GREEN }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" className="font-serif text-2xl font-semibold text-white">
          🌿 EnviroFriends
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#impact"
            className="hidden text-sm font-medium text-white/80 hover:text-white sm:block"
          >
            Tentang
          </a>
          <a
            href="#cara-kerja"
            className="hidden text-sm font-medium text-white/80 hover:text-white sm:block"
          >
            Cara Kerja
          </a>
          <Link
            href="/login"
            className="rounded-full border border-white px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full px-5 py-2 text-sm font-medium text-black shadow-sm transition-[filter] hover:brightness-95"
            style={{ backgroundColor: YELLOW }}
          >
            Daftar
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: DARK }}
    >
      {/* Video background — trik 150% agar cover penuh tanpa letterbox. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <iframe
          title="EnviroFriends hero"
          src="https://www.youtube.com/embed/voPkttQKe70?autoplay=1&mute=1&loop=1&playlist=voPkttQKe70&controls=0&showinfo=0&rel=0&modestbranding=1"
          allow="autoplay; encrypted-media"
          className="pointer-events-none absolute"
          style={{
            width: "150%",
            height: "150%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: "0",
          }}
        />
      </div>

      {/* Overlay gelap dari bawah. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)",
        }}
      />

      {/* Konten. */}
      <div className="absolute bottom-12 left-6 z-10 max-w-2xl text-white sm:bottom-16 sm:left-16">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-green-400">
          Program Edukasi Lingkungan
        </p>
        <h1 className="font-serif text-[40px] font-normal leading-tight md:text-[72px]">
          Masa Depan Bumi
          <br />
          Ada di Tanganmu.
        </h1>
        <p className="mt-4 max-w-lg text-lg text-white/80">
          Bergabung dengan ribuan pelajar Indonesia yang belajar menjaga
          lingkungan melalui aksi nyata setiap hari.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/register"
            className="rounded-full bg-white px-8 py-4 font-medium text-black transition-transform hover:scale-[1.03]"
          >
            Ayo Bergabung! 🌿
          </Link>
          <a
            href="#cara-kerja"
            className="rounded-full border border-white/60 px-8 py-4 font-medium text-white transition-colors hover:bg-white/10"
          >
            Pelajari Lebih Lanjut
          </a>
        </div>
      </div>

      {/* Scroll indicator. */}
      <a
        href="#impact"
        aria-label="Gulir ke bawah"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/80"
      >
        <svg
          className="h-8 w-8 animate-chevron-bounce"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </a>

      {/* Credit video. */}
      <a
        href="https://youtu.be/voPkttQKe70"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 z-10 text-xs italic text-white/50 transition-opacity hover:text-white/80"
      >
        📹 Video: UN Environment Programme
      </a>
    </section>
  );
}

function ImpactNumbers() {
  const items = [
    { to: 10000, suffix: "+", label: "Target Aksi per Tahun" },
    { to: 1000, suffix: "+", label: "Target Pelajar Aktif" },
    { to: 6, suffix: "", label: "Kategori Sampah Terdeteksi" },
  ];
  return (
    <section
      id="impact"
      className="relative overflow-hidden py-24 text-white"
      style={{ backgroundColor: GREEN }}
    >
      <CornerCircles />
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-3 md:gap-0">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`text-center md:px-8 ${
              i > 0 ? "md:border-l md:border-white/20" : ""
            }`}
          >
            <div
              className="font-serif text-[56px] leading-none md:text-[72px]"
              style={{ color: YELLOW }}
            >
              <Counter to={item.to} suffix={item.suffix} />
            </div>
            <div className="mt-2 text-sm uppercase tracking-widest text-white/80">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CaraKerja() {
  const steps = [
    {
      num: "01",
      emoji: "📸",
      title: "Jadi Detektif Sampah! 🔍",
      desc: "Cari sampah di sekitarmu dan jadilah pahlawan lingkungan pertamamu hari ini!",
    },
    {
      num: "02",
      emoji: "🤖",
      title: "Tebak Bareng Robotku! 🤖",
      desc: "Foto sampahmu dan teman robotmu akan ikut nebak bareng. Siapa yang paling jeli?",
    },
    {
      num: "03",
      emoji: "⭐",
      title: "Naik Level & Jadi Juara! 🏆",
      desc: "Kumpulkan poin sebanyaknya, unlock badge keren, dan tunjukkan kamu Pejuang Bumi sejati!",
    },
  ];
  return (
    <section id="cara-kerja" className="bg-white py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-12">
        <Reveal>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: GREEN }}
          >
            Cara Kerja
          </p>
          <h2 className="mt-3 font-serif text-4xl leading-tight text-gray-900 md:text-5xl">
            Tiga Langkah Mudah
            <br />
            Menjadi Pejuang Bumi
          </h2>
        </Reveal>

        <div className="mt-20 grid grid-cols-1 gap-16 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 150}>
              <div
                className="relative h-full overflow-hidden rounded-2xl border-l-4 p-8"
                style={{ backgroundColor: LIGHT, borderLeftColor: GREEN }}
              >
                <span
                  className="pointer-events-none absolute -right-2 -top-6 select-none font-serif leading-none"
                  style={{ fontSize: "120px", color: GREEN }}
                  aria-hidden
                >
                  {step.num}
                </span>
                <div className="relative">
                  <div className="text-5xl" aria-hidden>
                    {step.emoji}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-xs text-base text-gray-500">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section
      className="relative overflow-hidden py-24 text-center"
      style={{ backgroundColor: YELLOW }}
    >
      <CornerCircles color={GREEN} opacity={0.15} />
      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <Reveal>
          <h2 className="font-serif text-4xl text-gray-900 md:text-5xl">
            Siap Jadi Pejuang Lingkungan?
          </h2>
          <p className="mt-4 text-lg text-gray-900/70">
            Gratis. Tanpa instalasi. Mulai dalam 30 detik.
          </p>
          <div className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-full px-10 py-5 text-lg font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: GREEN }}
            >
              Daftar Sekarang! 🌱
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="text-white" style={{ backgroundColor: DARK }}>
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-12 sm:flex-row sm:items-center lg:px-12">
        <div>
          <div className="font-serif text-xl font-semibold text-white">
            🌿 EnviroFriends
          </div>
          <p className="mt-1 text-sm text-white/70">
            Belajar menjaga bumi lewat aksi nyata.
          </p>
        </div>
        <p className="text-sm text-white/70">
          © {new Date().getFullYear()} EnviroFriends. LIDM UGM 2026.
        </p>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <main className="overflow-clip-x">
      <Navbar />
      <Hero />
      <ImpactNumbers />
      <CaraKerja />
      <CtaSection />
      <Footer />
    </main>
  );
}
