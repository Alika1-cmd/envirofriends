import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { calculateLevel } from "@/lib/gamification";
import { avatarEmoji } from "@/lib/content";
import BottomNav from "@/components/BottomNav";
import LogoutButton from "@/components/LogoutButton";

const GREEN = "#16a34a";
const YELLOW = "#facc15";
const DECOR = "#15803d";

export default async function ProfilePage() {
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

  const username = profile?.username ?? user.email?.split("@")[0] ?? "Pejuang";
  const points = profile?.total_points ?? 0;
  const streak = profile?.streak_count ?? 0;
  const level = profile?.level ?? calculateLevel(points);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <section
        className="relative overflow-hidden px-6 pb-12 pt-10 text-center text-white"
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

        <div className="relative mx-auto max-w-lg">
          <span
            className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-white text-5xl"
            aria-hidden
          >
            {avatarEmoji(profile?.avatar_id)}
          </span>
          <h1 className="mt-4 font-serif text-3xl">{username}</h1>
          <span
            className="mt-2 inline-block rounded-full px-4 py-1 text-sm font-bold text-gray-900"
            style={{ backgroundColor: YELLOW }}
          >
            Level {level}
          </span>
          <p className="mt-2 text-sm text-white/70">{user.email}</p>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-6 px-6 pt-6">
        <section className="grid grid-cols-2 gap-3">
          <StatCard emoji="⭐" value={points} label="Total Poin" />
          <StatCard emoji="🔥" value={streak} label="Streak Hari" />
        </section>

        <LogoutButton className="w-full rounded-full border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100" />
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
    <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
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
