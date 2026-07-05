// GET /api/ecofacts
// Kembalikan 6 fakta lingkungan harian untuk anak SD. Di-cache per tanggal di
// tabel ecofacts_cache: hari yang sama hanya sekali hit ke Gemini.
// Jika cache kosong → generate via Gemini (Google AI Studio) → simpan → kembalikan.

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@/lib/supabase-server";
import { ECOFACTS, type EcoFact } from "@/lib/content";

const MODEL = "gemini-2.5-flash";

const PROMPT = `Generate 6 fakta menarik tentang lingkungan dan sampah untuk anak SD Indonesia. Bahasa Indonesia yang mudah dipahami, fun, dan membuat anak termotivasi menjaga lingkungan. Jangan pakai istilah ilmiah sulit. Jangan pakai tanda em dash.

Balas HANYA dengan JSON array murni (tanpa teks lain, tanpa blok kode markdown), format persis:
[{"id":1,"title":"...","body":"...","category":"plastik","emoji":"♻️"}]

Aturan:
- id: angka 1 sampai 6
- title: judul singkat dan menarik
- body: 1-2 kalimat ramah anak SD
- emoji: satu emoji yang relevan
- category: salah satu dari plastik, kertas, logam, kaca, organik, residu`;

/** Tanggal lokal (YYYY-MM-DD). */
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Ambil array JSON dari teks model (buang pembungkus ```json bila ada). */
function parseFacts(text: string): EcoFact[] | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1));
    if (!Array.isArray(raw) || raw.length === 0) return null;
    return raw.map((f, i) => ({
      id: typeof f.id === "number" ? f.id : i + 1,
      title: String(f.title ?? ""),
      body: String(f.body ?? ""),
      category: String(f.category ?? "umum"),
      emoji: String(f.emoji ?? "🌱"),
    }));
  } catch {
    return null;
  }
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
    .from("ecofacts_cache")
    .select("facts")
    .eq("generated_date", today)
    .maybeSingle();

  if (cached?.facts) {
    return NextResponse.json({ facts: cached.facts, source: "cache" });
  }

  // 2. Belum ada → generate via Gemini.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY belum di-set");
    return NextResponse.json({ facts: ECOFACTS.slice(0, 6), source: "fallback" });
  }

  let facts: EcoFact[] | null = null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: PROMPT,
      config: { responseMimeType: "application/json" },
    });
    const text = response.text ?? "";
    facts = parseFacts(text);
  } catch (err) {
    console.error("Gemini error:", err);
  }

  // Jika generate gagal → fallback konten hardcode supaya halaman tetap hidup.
  if (!facts) {
    return NextResponse.json({ facts: ECOFACTS.slice(0, 6), source: "fallback" });
  }

  // 3. Simpan ke cache (abaikan error tulis — fakta tetap dikembalikan).
  const { error: insertError } = await supabase
    .from("ecofacts_cache")
    .insert({ facts, generated_date: today });
  if (insertError) {
    console.error("Insert ecofacts_cache error:", insertError);
  }

  return NextResponse.json({ facts, source: "generated" });
}
