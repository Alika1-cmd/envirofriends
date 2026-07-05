"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/challenge", label: "Challenge", icon: "📸" },
  { href: "/ecofacts", label: "EcoFacts", icon: "🌱" },
  { href: "/quiz", label: "Quiz", icon: "🧠" },
  { href: "/profile", label: "Profil", icon: "👤" },
];

const GREEN = "#16a34a";

/** Navigasi bawah tetap untuk area login (dashboard, challenge, dst). */
export default function BottomNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors"
              style={{ color: active ? GREEN : "#9ca3af" }}
            >
              <span className="text-xl leading-none" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
