// Tipe data domain EnviroFriends — selaras dengan schema Supabase (lihat CLAUDE.md).

export type WasteCategory =
  | "plastik"
  | "kertas"
  | "logam"
  | "kaca"
  | "organik"
  | "residu";

export const WASTE_CATEGORIES: WasteCategory[] = [
  "plastik",
  "kertas",
  "logam",
  "kaca",
  "organik",
  "residu",
];

/** Label tampilan untuk tiap kategori sampah. */
export const WASTE_LABELS: Record<WasteCategory, string> = {
  plastik: "Plastik",
  kertas: "Kertas",
  logam: "Logam",
  kaca: "Kaca",
  organik: "Organik",
  residu: "Residu",
};

export interface Profile {
  id: string;
  username: string;
  avatar_id: number; // 1–5
  total_points: number;
  streak_count: number;
  last_active: string | null; // date (YYYY-MM-DD)
  level: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  waste_category: WasteCategory;
  points_reward: number;
  difficulty: number; // 1=pemula, 2=menengah, 3=mahir
  active_date: string; // date (YYYY-MM-DD)
}

export interface Submission {
  id: string;
  user_id: string;
  challenge_id: string;
  ai_label: string;
  ai_confidence: number; // 0–1
  verified: boolean;
  created_at?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[]; // ["A","B","C","D"]
  correct_index: number; // 0-based
  category: string;
  difficulty: number; // 1–3
}

export interface QuizHistory {
  id: string;
  user_id: string;
  question_id: string;
  is_correct: boolean;
}

/** Hasil mentah satu label dari Google Cloud Vision. */
export interface VisionLabel {
  description: string;
  score: number; // 0–1
}
