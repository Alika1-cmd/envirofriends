// POST /api/quiz/complete
// Tambah poin setelah user menyelesaikan kuis harian.
// Aturan: 10 poin per jawaban benar. Boleh didapat berkali-kali per hari
// (tiap kali kuis selesai) — TIDAK dibatasi sekali per hari (sesuai desain).
//
// correctCount dikirim dari client, TAPI divalidasi terhadap jumlah soal
// kuis hari ini (quiz_cache) supaya tidak bisa dikirim angka sembarangan.
// Catatan: correctIndex tiap soal memang sudah dikirim ke client lewat
// GET /api/quiz, jadi berbeda dengan alur Challenge (foto tidak bisa
// diverifikasi di client), di sini tidak ada "rahasia" tambahan yang bisa
// dijaga di server — validasi difokuskan ke batas wajar (bukan anti-cheat).

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { calculateLevel } from "@/lib/gamification";

const POINTS_PER_CORRECT_ANSWER = 10;

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

  let body: { correctCount?: number; total?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const rawCorrect = Number(body.correctCount);
  const rawTotal = Number(body.total);
  if (!Number.isInteger(rawCorrect) || !Number.isInteger(rawTotal)) {
    return NextResponse.json({ error: "correctCount/total wajib angka" }, { status: 400 });
  }

  // Ambil jumlah soal kuis hari ini sebagai batas atas yang valid.
  const today = isoDate(new Date());
  const { data: cached } = await supabase
    .from("quiz_cache")
    .select("questions")
    .eq("generated_date", today)
    .maybeSingle();

  const questionsToday = Array.isArray(cached?.questions) ? cached.questions.length : rawTotal;
  const maxTotal = questionsToday > 0 ? questionsToday : rawTotal;

  // Clamp supaya tidak bisa kirim angka besar sembarangan.
  const total = Math.max(0, Math.min(rawTotal, maxTotal));
  const correctCount = Math.max(0, Math.min(rawCorrect, total));

  const pointsEarned = correctCount * POINTS_PER_CORRECT_ANSWER;

  const { data: profile } = await supabase
    .from("profiles")
    .select("total_points")
    .eq("id", user.id)
    .single();

  const currentPoints = profile?.total_points ?? 0;
  const newTotal = currentPoints + pointsEarned;
  const newLevel = calculateLevel(newTotal);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ total_points: newTotal, level: newLevel })
    .eq("id", user.id);

  if (updateError) {
    console.error("Update profile (quiz points) error:", updateError);
    return NextResponse.json({ error: "Gagal menyimpan poin" }, { status: 500 });
  }

  return NextResponse.json({ pointsEarned, newTotal, newLevel });
}
