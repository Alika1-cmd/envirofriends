// POST /api/points
// Tambah poin + hitung streak + update level setelah challenge terverifikasi.
// userId dari SESSION; points diambil dari tabel challenges (BUKAN dari body)
// supaya tidak bisa dimanipulasi client.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { calculateLevel } from "@/lib/gamification";

/** Tanggal lokal (YYYY-MM-DD). */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { challengeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { challengeId } = body;
  if (!challengeId) {
    return NextResponse.json(
      { error: "challengeId wajib diisi" },
      { status: 400 },
    );
  }

  // Poin dari server, bukan dari client.
  const { data: challenge } = await supabase
    .from("challenges")
    .select("points_reward")
    .eq("id", challengeId)
    .single();
  if (!challenge) {
    return NextResponse.json(
      { error: "Challenge tidak ditemukan" },
      { status: 404 },
    );
  }
  const pointsEarned = challenge.points_reward;

  // Pastikan benar-benar ada submission terverifikasi untuk challenge ini —
  // poin tidak bisa diklaim tanpa foto yang lolos deteksi.
  const { data: verifiedSub } = await supabase
    .from("submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("challenge_id", challengeId)
    .eq("verified", true)
    .limit(1);
  if (!verifiedSub || verifiedSub.length === 0) {
    return NextResponse.json(
      { error: "Belum ada foto terverifikasi untuk challenge ini" },
      { status: 403 },
    );
  }

  // Ambil profil saat ini.
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_points, streak_count, last_active")
    .eq("id", user.id)
    .single();

  const currentPoints = profile?.total_points ?? 0;
  const currentStreak = profile?.streak_count ?? 0;
  const lastActive = profile?.last_active ?? null;

  const today = isoDate(new Date());
  const yesterday = isoDate(new Date(Date.now() - 86_400_000));

  let newStreak: number;
  if (lastActive === today) {
    newStreak = Math.max(currentStreak, 1); // sudah aktif hari ini
  } else if (lastActive === yesterday) {
    newStreak = currentStreak + 1; // lanjut beruntun
  } else {
    newStreak = 1; // reset
  }

  const newTotal = currentPoints + pointsEarned;
  const newLevel = calculateLevel(newTotal);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      total_points: newTotal,
      streak_count: newStreak,
      last_active: today,
      level: newLevel,
    })
    .eq("id", user.id);
  if (updateError) {
    console.error("Update profile error:", updateError);
    return NextResponse.json(
      { error: "Gagal menyimpan poin" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    newTotal,
    newStreak,
    newLevel,
    pointsEarned,
  });
}
