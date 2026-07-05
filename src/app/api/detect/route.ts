// POST /api/detect
// Terima foto (base64) + challengeId, deteksi via Google Vision, simpan
// submission, lalu kembalikan hasil. userId diambil dari SESSION, bukan body.

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import {
  detectWaste,
  demoDetect,
  mapLabelsToCategory,
  CONFIDENCE_THRESHOLD,
  DEMO_MODE,
} from "@/lib/vision";
import type { CategoryMatch } from "@/lib/vision";
import type { WasteCategory } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { imageBase64?: string; challengeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { imageBase64, challengeId } = body;
  if (!imageBase64 || !challengeId) {
    return NextResponse.json(
      { error: "imageBase64 dan challengeId wajib diisi" },
      { status: 400 },
    );
  }

  // Deteksi sampah (atau simulasi bila DEMO_MODE).
  let match: CategoryMatch;
  if (DEMO_MODE) {
    const { data: ch } = await supabase
      .from("challenges")
      .select("waste_category")
      .eq("id", challengeId)
      .single();
    match = demoDetect((ch?.waste_category as WasteCategory) ?? "plastik");
  } else {
    let detection;
    try {
      detection = await detectWaste(imageBase64);
    } catch (err) {
      console.error("Vision error:", err);
      return NextResponse.json(
        { error: "Gagal memproses gambar" },
        { status: 502 },
      );
    }
    match = mapLabelsToCategory(detection.rawLabels);
  }

  // Verified jika confidence cukup DAN ada kategori yang benar-benar match
  // (residu = fallback ketika tidak ada yang cocok).
  const verified =
    match.confidence >= CONFIDENCE_THRESHOLD && match.category !== "residu";

  // Simpan submission (RLS membatasi ke user yang sedang login).
  const { error: insertError } = await supabase.from("submissions").insert({
    user_id: user.id,
    challenge_id: challengeId,
    ai_label: match.matchedLabel,
    ai_confidence: match.confidence,
    verified,
  });
  if (insertError) {
    console.error("Insert submission error:", insertError);
    return NextResponse.json(
      { error: "Gagal menyimpan hasil" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    label: match.matchedLabel,
    confidence: match.confidence,
    verified,
    category: match.category,
  });
}
