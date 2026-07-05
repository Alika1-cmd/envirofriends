// Logika gamifikasi: level, difficulty, dan pemilihan challenge harian
// yang dipersonalisasi. Lihat CLAUDE.md "Key Business Logic".

import { createServerClient } from "@/lib/supabase-server";
import type { Challenge, WasteCategory } from "@/lib/types";

/**
 * Level dari total poin (CLAUDE.md):
 *  L1: 0–49 | L2: 50–149 | L3: 150–299 | L4: 300–499 | L5: 500+
 */
export function calculateLevel(points: number): number {
  if (points >= 500) return 5;
  if (points >= 300) return 4;
  if (points >= 150) return 3;
  if (points >= 50) return 2;
  return 1;
}

/**
 * Difficulty challenge dari total poin (CLAUDE.md "Personalisasi Challenge"):
 *  0–49 → 1 (pemula) | 50–149 → 2 (menengah) | 150+ → 3 (mahir)
 */
export function getDifficultyForPoints(points: number): number {
  if (points >= 150) return 3;
  if (points >= 50) return 2;
  return 1;
}

/** Poin minimum untuk tiap level — berguna untuk progress bar. */
export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500] as const;

/** Tanggal hari ini dalam format YYYY-MM-DD (waktu lokal server). */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Tentukan kategori sampah dengan error_rate tertinggi dari riwayat
 * submission user. Submission "gagal" = verified === false.
 * Mengembalikan null jika belum ada riwayat.
 */
async function categoryWithHighestErrorRate(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<WasteCategory | null> {
  // Ambil kategori via join ke challenges.
  const { data, error } = await supabase
    .from("submissions")
    .select("verified, challenges(waste_category)")
    .eq("user_id", userId);

  if (error || !data || data.length === 0) return null;

  const stats: Partial<
    Record<WasteCategory, { total: number; failed: number }>
  > = {};

  for (const row of data as unknown as Array<{
    verified: boolean;
    challenges: { waste_category: WasteCategory } | null;
  }>) {
    const cat = row.challenges?.waste_category;
    if (!cat) continue;
    const s = (stats[cat] ??= { total: 0, failed: 0 });
    s.total += 1;
    if (!row.verified) s.failed += 1;
  }

  let best: WasteCategory | null = null;
  let bestRate = -1;
  for (const cat of Object.keys(stats) as WasteCategory[]) {
    const s = stats[cat]!;
    const rate = s.failed / s.total;
    // Prioritaskan error_rate tertinggi; seri → kategori dengan submission
    // terbanyak (lebih banyak data = lebih relevan dilatih ulang).
    if (rate > bestRate || (rate === bestRate && best && s.total > stats[best]!.total)) {
      bestRate = rate;
      best = cat;
    }
  }

  return best;
}

/**
 * Pilih challenge hari ini untuk user.
 *
 * Alur:
 *  1. Ambil total_points user → tentukan difficulty target.
 *  2. Hitung kategori dengan error_rate tertinggi dari riwayat submission.
 *  3. Cari challenge aktif hari ini yang cocok (kategori + difficulty).
 *  4. Longgarkan kriteria bertahap bila tidak ada yang persis cocok.
 *
 * Mengembalikan Challenge atau null bila tidak ada challenge aktif sama sekali.
 */
export async function getNextChallenge(
  userId: string,
): Promise<Challenge | null> {
  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("id", userId)
    .single();

  const difficulty = getDifficultyForPoints(profile?.total_points ?? 0);
  const targetCategory = await categoryWithHighestErrorRate(supabase, userId);
  const today = todayISO();

  // Semua challenge aktif hari ini.
  const { data: active } = await supabase
    .from("challenges")
    .select("*")
    .eq("active_date", today);

  const pool = (active ?? []) as Challenge[];
  if (pool.length === 0) return null;

  // 1) Cocok kategori + difficulty.
  if (targetCategory) {
    const exact = pool.find(
      (c) => c.waste_category === targetCategory && c.difficulty === difficulty,
    );
    if (exact) return exact;
  }

  // 2) Cocok difficulty saja.
  const byDifficulty = pool.find((c) => c.difficulty === difficulty);
  if (byDifficulty) return byDifficulty;

  // 3) Cocok kategori saja.
  if (targetCategory) {
    const byCategory = pool.find((c) => c.waste_category === targetCategory);
    if (byCategory) return byCategory;
  }

  // 4) Apa pun yang aktif hari ini.
  return pool[0];
}
