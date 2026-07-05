import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { calculateLevel, getNextChallenge } from "@/lib/gamification";
import { avatarEmoji } from "@/lib/content";
import { WASTE_LABELS, type WasteCategory } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";

const GREEN = "#16a34a";
const YELLOW = "#facc15";
const DECOR = "#15803d";

type RecentSubmission = {
  id: string;
  ai_label: string;
  ai_confidence: number;
  verified: boolean;
  created_at: string | null;
  challenges: { title: string; waste_category: WasteCategory } | null;
};

export default async function DashboardPage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_id, total_points, streak_count, level")
    .eq("id", user.id)
    .single();

  const username =
    profile?.username ?? user.email?.split("@")[0] ?? "Pejuang";
  const points = profile?.total_points ?? 0;
  const streak = profile?.streak_count ?? 0;
  const level = profile?.level ?? calculateLevel(points);

  const challenge = await getNextChallenge(user.id);

  const { data: recentRaw } = await supabase
    .from("submissions")
    .select("id, ai_label, ai_confidence, verified, created_at, challenges(title, waste_category)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);
  const recent = (recentRaw ?? []) as unknown as RecentSubmission[];

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Greeting card. */}
      <section
        className="relative overflow-hidden px-6 pb-10 pt-8 text-white"
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

        <div className="relative mx-auto flex max-w-lg items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="grid h-14 w-14 place-items-center rounded-full bg-white text-3xl"
              aria-hidden
            >
              {avatarEmoji(profile?.avatar_id)}
            </span>
            <div>
              <h1 className="font-serif text-2xl leading-tight">
                Hei, {username}! 👋
              </h1>
              <span
                className="mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold text-gray-900"
                style={{ backgroundColor: YELLOW }}
              >
                Level {level}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-6 px-6 pt-6">
        {/* Stats. */}
        <section className="grid grid-cols-3 gap-3">
          <StatCard emoji="⭐" value={points} label="Poin" />
          <StatCard emoji="🔥" value={streak} label="Streak" />
          <StatCard emoji="🏆" value={level} label="Level" />
        </section>

        {/* Daily challenge. */}
        <section>
          <h2 className="mb-3 font-serif text-xl text-gray-900">
            Challenge Hari Ini
          </h2>
          {challenge ? (
            <div
              className="rounded-2xl border border-l-4 border-gray-100 bg-white p-5 shadow-sm"
              style={{ borderLeftColor: GREEN }}
            >
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-bold text-gray-900"
                style={{ backgroundColor: YELLOW }}
              >
                {WASTE_LABELS[challenge.waste_category]}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {challenge.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {challenge.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className="rounded-full px-3 py-1 text-sm font-bold text-gray-900"
                  style={{ backgroundColor: YELLOW }}
                >
                  +{challenge.points_reward} poin
                </span>
                <Link
                  href="/challenge"
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN }}
                >
                  Ayo Mulai! 🚀
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
              Belum ada challenge hari ini. Cek lagi nanti ya! 🌱
            </div>
          )}
        </section>

        {/* Recent submissions. */}
        <section>
          <h2 className="mb-3 font-serif text-xl text-gray-900">
            Aktivitas Terakhir
          </h2>
          {recent.length > 0 ? (
            <ul className="space-y-2">
              {recent.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <span className="text-2xl" aria-hidden>
                    {s.verified ? "✅" : "🔁"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900">
                      {s.challenges?.title ?? s.ai_label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.challenges
                        ? WASTE_LABELS[s.challenges.waste_category]
                        : "Sampah"}{" "}
                      · {Math.round(s.ai_confidence * 100)}% yakin
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatDate(s.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500">
              Belum ada aktivitas. Yuk mulai challenge pertamamu! 🚀
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}

function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
      <div className="text-3xl" aria-hidden>
        {emoji}
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">
        {value.toLocaleString("id-ID")}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
