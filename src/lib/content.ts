// Konten edukasi hardcode: EcoFacts + bank soal quiz. Bahasa Indonesia,
// tone ramah untuk anak SD–SMP. Lihat CLAUDE.md.

/** Emoji avatar untuk avatar_id 1–5. */
export const AVATARS = ["🐢", "🦊", "🐼", "🦉", "🐝"] as const;

/** Ambil emoji avatar dari avatar_id (fallback 🐢). */
export function avatarEmoji(avatarId: number | null | undefined): string {
  if (!avatarId || avatarId < 1 || avatarId > AVATARS.length) return AVATARS[0];
  return AVATARS[avatarId - 1];
}

export interface EcoFact {
  id: number;
  title: string;
  body: string;
  category: string;
  emoji: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

/** Kategori untuk filter EcoFacts. */
export const ECOFACT_CATEGORIES = [
  "Plastik",
  "Daur Ulang",
  "Organik",
  "Energi",
  "Air",
  "Umum",
] as const;

export const ECOFACTS: EcoFact[] = [
  {
    id: 1,
    title: "Botol Plastik Butuh 450 Tahun",
    body: "Satu botol plastik yang kamu buang sembarangan bisa bertahan di alam sampai 450 tahun sebelum benar-benar terurai. Itu lebih lama dari umur kakek buyutmu!",
    category: "Plastik",
    emoji: "🍶",
  },
  {
    id: 2,
    title: "Memilah = Setengah Pekerjaan Selesai",
    body: "Sampah yang sudah dipilah dari rumah jauh lebih mudah didaur ulang. Pisahkan plastik, kertas, dan organik di tempat berbeda supaya tidak tercampur.",
    category: "Daur Ulang",
    emoji: "♻️",
  },
  {
    id: 3,
    title: "Sampah Organik Jadi Kompos",
    body: "Sisa sayur, kulit buah, dan daun kering bisa diubah jadi kompos yang menyuburkan tanaman. Alih-alih jadi sampah, ia jadi makanan untuk tanah!",
    category: "Organik",
    emoji: "🍃",
  },
  {
    id: 4,
    title: "Daur Ulang Kaleng Hemat Energi",
    body: "Mendaur ulang satu kaleng aluminium menghemat energi yang cukup untuk menyalakan televisi selama 3 jam. Logam bisa didaur ulang berkali-kali tanpa kehilangan kualitas.",
    category: "Energi",
    emoji: "🥫",
  },
  {
    id: 5,
    title: "Kertas Bekas, Pohon Selamat",
    body: "Mendaur ulang setumpuk kertas setinggi 1 meter bisa menyelamatkan satu pohon. Pakai kertas bolak-balik sebelum membuangnya, ya!",
    category: "Daur Ulang",
    emoji: "📄",
  },
  {
    id: 6,
    title: "Kaca Bisa Didaur Ulang Selamanya",
    body: "Botol dan toples kaca bisa dilebur dan dibentuk ulang tanpa batas, tanpa pernah menurun mutunya. Pastikan kaca dibuang terpisah agar tidak pecah dan melukai petugas.",
    category: "Daur Ulang",
    emoji: "🫙",
  },
  {
    id: 7,
    title: "Matikan Keran Saat Menyikat Gigi",
    body: "Membiarkan keran menyala saat menyikat gigi bisa membuang sampai 6 liter air bersih. Tutup keran dan hemat air untuk masa depan.",
    category: "Air",
    emoji: "💧",
  },
  {
    id: 8,
    title: "Sampah Laut Mengancam Hewan",
    body: "Setiap tahun jutaan hewan laut seperti penyu dan ikan mati karena menelan plastik. Kantong plastik di laut sering dikira ubur-ubur oleh penyu.",
    category: "Plastik",
    emoji: "🐢",
  },
  {
    id: 9,
    title: "Bawa Tas Belanja Sendiri",
    body: "Satu tas kain bisa menggantikan ratusan kantong plastik sekali pakai. Kebiasaan kecil ini sangat besar dampaknya bila dilakukan banyak orang.",
    category: "Plastik",
    emoji: "🛍️",
  },
  {
    id: 10,
    title: "Reduce, Reuse, Recycle",
    body: "Urutannya penting: pertama kurangi pemakaian (reduce), lalu pakai ulang (reuse), baru daur ulang (recycle). Mengurangi sampah dari awal selalu paling baik.",
    category: "Umum",
    emoji: "🌍",
  },
];

export const QUIZ_QUESTIONS: QuizItem[] = [
  {
    question: "Botol air mineral plastik sebaiknya dibuang ke tempat sampah kategori apa?",
    options: ["Organik", "Plastik", "Kertas", "Logam"],
    correctIndex: 1,
    category: "Pemilahan Sampah",
  },
  {
    question: "Sisa kulit pisang termasuk jenis sampah apa?",
    options: ["Organik", "Plastik", "Kaca", "Residu"],
    correctIndex: 0,
    category: "Pemilahan Sampah",
  },
  {
    question: "Kaleng minuman bekas paling tepat masuk ke kategori...",
    options: ["Kertas", "Kaca", "Logam", "Organik"],
    correctIndex: 2,
    category: "Pemilahan Sampah",
  },
  {
    question: "Manakah yang termasuk sampah yang bisa didaur ulang?",
    options: ["Sisa makanan basi", "Botol kaca", "Tisu bekas", "Popok sekali pakai"],
    correctIndex: 1,
    category: "Daur Ulang",
  },
  {
    question: "Apa kepanjangan prinsip 3R dalam pengelolaan sampah?",
    options: [
      "Reduce, Reuse, Recycle",
      "Read, Run, Rest",
      "Reduce, Repeat, Return",
      "Reuse, Reduce, Repair",
    ],
    correctIndex: 0,
    category: "Daur Ulang",
  },
  {
    question: "Mengubah sampah organik menjadi pupuk alami disebut...",
    options: ["Insinerasi", "Pengomposan", "Sublimasi", "Filtrasi"],
    correctIndex: 1,
    category: "Organik",
  },
  {
    question: "Kira-kira berapa lama botol plastik terurai di alam?",
    options: ["1 tahun", "10 tahun", "100 tahun", "Ratusan tahun"],
    correctIndex: 3,
    category: "Dampak Lingkungan",
  },
  {
    question: "Hewan laut yang sering keliru menelan kantong plastik karena dikira ubur-ubur adalah...",
    options: ["Penyu", "Hiu", "Lumba-lumba", "Bintang laut"],
    correctIndex: 0,
    category: "Dampak Lingkungan",
  },
  {
    question: "Manakah tindakan yang paling baik untuk mengurangi sampah plastik?",
    options: [
      "Membeli air kemasan setiap hari",
      "Membawa botol minum sendiri",
      "Memakai sedotan plastik",
      "Membungkus makanan dengan plastik",
    ],
    correctIndex: 1,
    category: "Pengurangan Sampah",
  },
  {
    question: "Lampu yang tidak dipakai sebaiknya...",
    options: ["Dibiarkan menyala", "Dimatikan", "Diganti tiap hari", "Dinyalakan lebih terang"],
    correctIndex: 1,
    category: "Energi",
  },
  {
    question: "Toples kaca bekas selai paling baik kita...",
    options: ["Pecahkan lalu buang", "Pakai ulang untuk wadah", "Bakar", "Kubur di tanah"],
    correctIndex: 1,
    category: "Daur Ulang",
  },
  {
    question: "Sampah yang tidak bisa didaur ulang maupun dikompos disebut sampah...",
    options: ["Organik", "Residu", "Plastik", "Logam"],
    correctIndex: 1,
    category: "Pemilahan Sampah",
  },
  {
    question: "Kertas bekas sebaiknya kita...",
    options: ["Buang ke sungai", "Daur ulang", "Bakar di halaman", "Campur dengan sisa makanan"],
    correctIndex: 1,
    category: "Daur Ulang",
  },
  {
    question: "Kebiasaan hemat air yang benar saat menyikat gigi adalah...",
    options: [
      "Membiarkan keran menyala",
      "Menutup keran saat menyikat",
      "Memakai air panas terus",
      "Menyikat di bawah keran mengalir",
    ],
    correctIndex: 1,
    category: "Air",
  },
  {
    question: "Mengapa sampah harus dipilah dari rumah?",
    options: [
      "Agar lebih mudah didaur ulang",
      "Supaya tempat sampah penuh",
      "Agar bau lebih menyengat",
      "Tidak ada gunanya",
    ],
    correctIndex: 0,
    category: "Pemilahan Sampah",
  },
];
