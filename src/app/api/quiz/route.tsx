// GET /api/quiz
// Kembalikan 5 soal kuis harian untuk anak SD. Di-cache per tanggal di tabel
// quiz_cache: hari yang sama hanya sekali hit ke Gemini.
// Jika cache kosong → generate via Gemini (Google AI Studio) → simpan → kembalikan.

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase-server";
import { QUIZ_QUESTIONS } from "@/lib/content";

const MODEL = "gemini-2.5-flash";

const PROMPT = `Buat 5 soal kuis tentang sampah dan lingkungan untuk anak SD Indonesia. Bahasa yang mudah, fun, dan tidak ada istilah ilmiah sulit. Jangan pakai tanda em dash. Setiap soal punya 4 pilihan jawaban (A/B/C/D).

Balas HANYA dengan JSON array murni (tanpa teks lain, tanpa blok kode markdown), format persis:
[{"id":"q1","question":"...","options":["...","...","...","..."],"correctIndex":0,"category":"plastik","explanation":"..."}]

Aturan:
- question: pertanyaan singkat ramah anak SD
- options: tepat 4 pilihan jawaban
- correctIndex: angka 0 sampai 3 (indeks jawaban benar)
- category: salah satu dari plastik, kertas, logam, kaca, organik, residu
- explanation: penjelasan singkat kenapa jawaban itu benar, ramah anak SD, pakai emoji`;

/** Bentuk soal harian yang dikirim ke client. */
export interface DailyQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  explanation: string;
}

/** Tanggal lokal (YYYY-MM-DD). */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Ambil array JSON dari teks model dan validasi tiap soal. */
function parseQuestions(text: string): DailyQuizQuestion[] | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(raw) || raw.length === 0) return null;

    const out: DailyQuizQuestion[] = [];
    for (const q of raw) {
      const options = Array.isArray(q.options)
        ? q.options.map((o: unknown) => String(o))
        : [];
      if (options.length !== 4) continue; // butuh tepat 4 pilihan
      const idx = Number(q.correctIndex);
      if (!Number.isInteger(idx) || idx < 0 || idx > 3) continue;
      out.push({
        // ID selalu UUID baru supaya valid disimpan ke quiz_history.
        id: randomUUID(),
        question: String(q.question ?? ""),
        options,
        correctIndex: idx,
        category: String(q.category ?? "umum"),
        explanation: String(q.explanation ?? ""),
      });
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** Soal cadangan dari konten hardcode (5 soal acak). */
function fallbackQuestions(): DailyQuizQuestion[] {
  return QUIZ_QUESTIONS.slice(0, 5).map((q) => ({
    id: randomUUID(),
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    category: q.category,
    explanation: "",
  }));
}

export async function GET() {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const today = isoDate(new Date());

  // 1. Cek cache hari ini.
  const { data: cached } = await supabase
    .from("quiz_cache")
    .select("questions")
    .eq("generated_date", today)
    .maybeSingle();

  if (cached?.questions) {
    return NextResponse.json({ questions: cached.questions, source: "cache" });
  }

  // 2. Belum ada → generate via Gemini.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY belum di-set");
    return NextResponse.json({
      questions: fallbackQuestions(),
      source: "fallback",
    });
  }

  let questions: DailyQuizQuestion[] | null = null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: PROMPT,
      config: { responseMimeType: "application/json" },
    });
    const text = response.text ?? "";
    questions = parseQuestions(text);
  } catch (err) {
    console.error("Gemini error:", err);
  }

  // Generate gagal → fallback supaya halaman tetap hidup.
  if (!questions) {
    return NextResponse.json({
      questions: fallbackQuestions(),
      source: "fallback",
    });
  }

  // 3. Simpan ke cache (abaikan error tulis — soal tetap dikembalikan).
  const { error: insertError } = await supabase
    .from("quiz_cache")
    .insert({ questions, generated_date: today });
  if (insertError) {
    console.error("Insert quiz_cache error:", insertError);
  }

  return NextResponse.json({ questions, source: "generated" });
}
