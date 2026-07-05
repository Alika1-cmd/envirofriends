"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import BottomNav from "@/components/BottomNav";

const GREEN = "#16a34a";
const DECOR = "#15803d";
const YELLOW = "#facc15";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  explanation: string;
}

export default function QuizPage() {
  const [supabase] = useState(() => createBrowserClient());

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  // Muat soal + identitas user.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (alive) setUserId(user?.id ?? null);

        const res = await fetch("/api/quiz");
        if (!res.ok) throw new Error("gagal memuat");
        const data = await res.json();
        if (alive) setQuestions(data.questions ?? []);
      } catch {
        if (alive) setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  const total = questions.length;
  const current = questions[index];
  const answered = selected !== null;
  const correctCount = results.filter(Boolean).length;

  function choose(optionIndex: number) {
    if (answered) return;
    setSelected(optionIndex);
    setResults((r) => [...r, optionIndex === current.correctIndex]);
  }

  async function saveHistory(finalResults: boolean[]) {
    if (!userId) return;
    const rows = questions.map((q, i) => ({
      user_id: userId,
      question_id: q.id,
      is_correct: finalResults[i] ?? false,
    }));
    try {
      await supabase.from("quiz_history").insert(rows);
    } catch {
      /* abaikan kegagalan simpan agar kuis tetap selesai */
    }
  }

  function next() {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
      void saveHistory(results);
    }
  }

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
        <div className="relative mx-auto max-w-2xl">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold text-gray-900"
            style={{ backgroundColor: YELLOW }}
          >
            KUIS HARI INI 🧠
          </span>
          <h1 className="mt-3 font-serif text-3xl">Quiz Harian</h1>
          <p className="mt-1 text-white/80">
            Uji pengetahuanmu soal sampah dan lingkungan!
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-6 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl">🤖</div>
            <p className="mt-4 text-gray-600">
              Robot lagi bikin soal seru buat kamu...
            </p>
          </div>
        ) : error || total === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            Yah, soalnya lagi ngumpet. Coba buka lagi sebentar ya! 🧩
          </p>
        ) : finished ? (
          <Summary correctCount={correctCount} total={total} />
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {/* Progress. */}
            <div className="flex items-center justify-between text-sm font-medium text-gray-500">
              <span>
                Soal {index + 1} dari {total}
              </span>
              <span>Benar: {correctCount}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${((index + (answered ? 1 : 0)) / total) * 100}%`,
                  backgroundColor: GREEN,
                }}
              />
            </div>

            {/* Pertanyaan dalam card hijau muda. */}
            <div className="mt-5 rounded-2xl bg-green-50 p-5">
              <h2 className="font-serif text-xl text-gray-900">
                {current.question}
              </h2>
            </div>

            {/* Pilihan jawaban. */}
            <div className="mt-4 space-y-3">
              {current.options.map((opt, i) => {
                const isCorrect = i === current.correctIndex;
                const isPicked = i === selected;

                let style: React.CSSProperties = {};
                let cls =
                  "w-full rounded-full border-2 px-5 py-3 text-left font-medium transition-colors";
                if (!answered) {
                  cls +=
                    " bg-white text-gray-800 hover:bg-green-50";
                  style = { borderColor: GREEN };
                } else if (isCorrect) {
                  cls += " border-transparent text-white";
                  style = { backgroundColor: GREEN };
                } else if (isPicked) {
                  cls += " border-transparent bg-red-100 text-red-700";
                } else {
                  cls += " border-gray-200 bg-white text-gray-400";
                }

                return (
                  <button
                    key={i}
                    onClick={() => choose(i)}
                    disabled={answered}
                    className={cls}
                    style={style}
                  >
                    <span className="mr-2" aria-hidden>
                      {answered && isCorrect
                        ? "✅"
                        : answered && isPicked
                          ? "❌"
                          : ""}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Feedback + penjelasan + lanjut. */}
            {answered && (
              <div className="mt-5">
                <p
                  className="text-center font-semibold"
                  style={{
                    color: selected === current.correctIndex ? GREEN : "#dc2626",
                  }}
                >
                  {selected === current.correctIndex
                    ? "Benar! Keren banget 🌟"
                    : "Belum tepat, jangan menyerah ya! 💪"}
                </p>
                {current.explanation && (
                  <div className="mt-3 rounded-2xl bg-yellow-50 p-4 text-sm leading-relaxed text-gray-700">
                    {current.explanation}
                  </div>
                )}
                <button
                  onClick={next}
                  className="mt-4 w-full rounded-full py-3 text-lg font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: GREEN }}
                >
                  {index + 1 < total ? "Soal Berikutnya! 👉" : "Lihat Hasil 🎉"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function Summary({
  correctCount,
  total,
}: {
  correctCount: number;
  total: number;
}) {
  let emoji = "🌱";
  let praise = "Jangan menyerah! Coba lagi besok! 🌱";
  if (correctCount >= 4) {
    emoji = "🏆";
    praise = "Luar biasa! Kamu Pejuang Bumi Sejati! 🏆";
  } else if (correctCount >= 2) {
    emoji = "💪";
    praise = "Bagus! Terus belajar ya! 💪";
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div className="text-6xl" aria-hidden>
        {emoji}
      </div>
      <h2 className="mt-4 font-serif text-2xl text-gray-900">
        Kamu jawab {correctCount} dari {total} soal dengan benar! 🎉
      </h2>
      <div
        className="mx-auto mt-4 inline-block rounded-full px-6 py-2 text-lg font-bold text-gray-900"
        style={{ backgroundColor: YELLOW }}
      >
        {praise}
      </div>
      <div className="mt-6">
        <Link
          href="/dashboard"
          className="inline-block rounded-full px-6 py-3 font-semibold text-white"
          style={{ backgroundColor: GREEN }}
        >
          Kembali ke Beranda 🏠
        </Link>
      </div>
    </div>
  );
}
