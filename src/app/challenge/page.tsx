import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getNextChallenge } from "@/lib/gamification";
import { WASTE_LABELS } from "@/lib/types";
import BottomNav from "@/components/BottomNav";
import CameraCapture from "@/components/CameraCapture";

const GREEN = "#16a34a";
const YELLOW = "#facc15";
const DECOR = "#15803d";

export default async function ChallengePage() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const challenge = await getNextChallenge(user.id);

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
        <div className="relative mx-auto max-w-lg">
          <h1 className="font-serif text-3xl">Challenge Hari Ini 📸</h1>
          <p className="mt-1 text-white/80">
            Foto sampahnya, biar robotku yang menebak!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-lg space-y-6 px-6 pt-6">
        {challenge ? (
          <>
            {/* Info challenge. */}
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
              <h2 className="mt-3 text-lg font-semibold text-gray-900">
                {challenge.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {challenge.description}
              </p>
              <p className="mt-3 text-sm font-medium" style={{ color: GREEN }}>
                Selesaikan dan dapat {challenge.points_reward} poin! ⭐
              </p>
            </div>

            {/* Kamera. */}
            <CameraCapture
              challengeId={challenge.id}
              userId={user.id}
              points={challenge.points_reward}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            Belum ada challenge hari ini. Cek lagi nanti ya! 🌱
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
