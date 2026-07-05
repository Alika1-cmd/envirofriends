// Google Cloud Vision — Label Detection wrapper.
//
// HANYA dipanggil dari server (API route /api/detect). GOOGLE_VISION_API_KEY
// tidak boleh bocor ke client. Lihat CLAUDE.md "AI Waste Detection Flow".

import { WASTE_LABELS, type VisionLabel, type WasteCategory } from "@/lib/types";

const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

/** Ambang verifikasi: confidence >= 0.70 dianggap valid (CLAUDE.md). */
export const CONFIDENCE_THRESHOLD = 0.7;

/**
 * Mode demo: lewati Google Vision (mis. billing belum aktif) dan kembalikan
 * deteksi simulasi. Aktifkan dengan DEMO_MODE=true di environment.
 * Set DEMO_MODE=false (atau hapus) untuk memakai Vision sungguhan.
 */
export const DEMO_MODE = process.env.DEMO_MODE === "true";

/**
 * Deteksi simulasi untuk DEMO_MODE — menghasilkan kategori sesuai challenge
 * dengan confidence tinggi yang wajar, supaya alur poin/streak bisa didemo
 * tanpa Google Vision.
 */
export function demoDetect(category: WasteCategory): CategoryMatch {
  const confidence = Math.round((0.85 + Math.random() * 0.12) * 100) / 100;
  return {
    category,
    matchedLabel: `${WASTE_LABELS[category]} (demo)`,
    confidence,
  };
}

export interface DetectWasteResult {
  /** Label teratas dari Vision (description). */
  label: string;
  /** Confidence label teratas (0–1). */
  confidence: number;
  /** Seluruh label mentah hasil deteksi, terurut score menurun. */
  rawLabels: VisionLabel[];
}

/**
 * Kirim gambar (base64) ke Google Vision Label Detection.
 * `imageBase64` boleh berupa data URL ("data:image/jpeg;base64,...") atau
 * base64 polos — prefix akan dibersihkan otomatis.
 */
export async function detectWaste(
  imageBase64: string,
): Promise<DetectWasteResult> {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_VISION_API_KEY belum diset di environment server.");
  }

  // Buang prefix data URL bila ada.
  const content = imageBase64.includes(",")
    ? imageBase64.slice(imageBase64.indexOf(",") + 1)
    : imageBase64;

  const res = await fetch(`${VISION_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content },
          features: [{ type: "LABEL_DETECTION", maxResults: 10 }],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Google Vision error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const annotations = data?.responses?.[0]?.labelAnnotations ?? [];

  const rawLabels: VisionLabel[] = annotations.map(
    (a: { description?: string; score?: number }) => ({
      description: a.description ?? "",
      score: typeof a.score === "number" ? a.score : 0,
    }),
  );

  const top = rawLabels[0];
  return {
    label: top?.description ?? "",
    confidence: top?.score ?? 0,
    rawLabels,
  };
}

// --- Mapping label Vision → kategori sampah ----------------------------------

/** Kata kunci per kategori (urutan pengecekan penting, lihat catatan kaca). */
const CATEGORY_KEYWORDS: Record<Exclude<WasteCategory, "residu">, string[]> = {
  plastik: ["plastic", "bottle", "bag", "container", "packaging", "plastic bottle"],
  kertas: ["paper", "cardboard", "newspaper", "magazine", "carton"],
  logam: ["metal", "tin", "aluminum", "can", "steel", "iron"],
  kaca: ["glass", "jar"],
  organik: ["food", "vegetable", "fruit", "organic", "leaf", "wood"],
};

export interface CategoryMatch {
  category: WasteCategory;
  /** Label Vision yang memicu kategori (untuk disimpan sebagai ai_label). */
  matchedLabel: string;
  /** Confidence label pemicu (0–1) — dipakai untuk verifikasi. */
  confidence: number;
}

/**
 * Petakan daftar label Vision ke salah satu dari 6 kategori sampah.
 *
 * Strategi: cek setiap label (terurut confidence menurun) terhadap kata
 * kunci tiap kategori; kategori dari label dengan confidence tertinggi yang
 * menang. Khusus "kaca" hanya berlaku bila tidak ada indikasi "plastic"
 * (botol kaca vs botol plastik sering tertukar — CLAUDE.md).
 */
export function mapLabelsToCategory(rawLabels: VisionLabel[]): CategoryMatch {
  const hasPlastic = rawLabels.some((l) =>
    /\bplastic\b/i.test(l.description),
  );

  for (const { description, score } of rawLabels) {
    const text = description.toLowerCase();

    for (const category of Object.keys(CATEGORY_KEYWORDS) as Array<
      Exclude<WasteCategory, "residu">
    >) {
      if (category === "kaca" && hasPlastic) continue; // hindari false-positive
      const hit = CATEGORY_KEYWORDS[category].some((kw) => text.includes(kw));
      if (hit) {
        return { category, matchedLabel: description, confidence: score };
      }
    }
  }

  // Tidak ada yang cocok → residu (fallback).
  const top = rawLabels[0];
  return {
    category: "residu",
    matchedLabel: top?.description ?? "Tidak terdeteksi",
    confidence: top?.score ?? 0,
  };
}
