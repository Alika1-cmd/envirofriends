# EnviroFriends — Project Context for Claude Code

## Project Overview
EnviroFriends adalah web app gamifikasi edukasi lingkungan untuk anak-anak (SD–SMP).
Pengguna menyelesaikan challenge harian dengan memfoto sampah nyata, diverifikasi AI
(Google Cloud Vision CNN), dan mendapat poin/streak/level. Ada juga EcoFacts dan mini quiz harian.

**Deadline: 3 hari (LIDM UGM 2026 submission)**
**Status: Fresh scaffold, sedang dalam pengembangan aktif**

---

## Tech Stack
- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database + Auth**: Supabase (PostgreSQL + Supabase Auth)
- **AI**: Google Cloud Vision API (Label Detection) — CNN-based, mapping ke 6 kategori sampah
- **Deploy**: Vercel

---

## Project Structure
```
src/
├── app/
│   ├── page.tsx                  # Landing page (UNESCO-style, hero video background)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/page.tsx        # Poin, streak, level, avatar
│   ├── challenge/page.tsx        # Daily challenge + kamera + AI detect
│   ├── ecofacts/page.tsx         # Konten edukasi (hardcode)
│   ├── quiz/page.tsx             # Mini quiz harian
│   └── api/
│       ├── detect/route.ts       # POST: foto → Google Vision → return label+confidence
│       └── points/route.ts       # POST: update poin + streak user
├── components/
│   ├── CameraCapture.tsx         # Akses kamera browser, capture foto, submit
│   ├── StreakBadge.tsx           # Tampilan streak + badge gamifikasi
│   ├── EcoCard.tsx               # Kartu konten EcoFacts
│   ├── QuizWidget.tsx            # Komponen soal + pilihan + score
│   └── Navbar.tsx                # Navigasi utama
├── lib/
│   ├── supabase.ts               # Supabase client (browser + server SSR)
│   ├── vision.ts                 # detectWaste(imageBase64) → {label, confidence, rawLabels}
│   ├── gamification.ts           # calculateLevel(points), getNextChallenge(userId)
│   └── content.ts                # Data hardcode EcoFacts + quiz questions
└── middleware.ts                 # Protect /dashboard/*, /challenge/*, /quiz/*, /ecofacts/*
```

---

## Database Schema (Supabase)

### profiles
| kolom | tipe | keterangan |
|---|---|---|
| id | uuid | FK → auth.users |
| username | text | unique |
| avatar_id | integer | 1–5 (pilihan avatar) |
| total_points | integer | akumulasi poin |
| streak_count | integer | hari berturut aktif |
| last_active | date | untuk hitung streak |
| level | integer | dihitung dari total_points |

### challenges
| kolom | tipe | keterangan |
|---|---|---|
| id | uuid | PK |
| title | text | judul challenge |
| description | text | instruksi |
| waste_category | text | plastik/kertas/logam/kaca/organik/residu |
| points_reward | integer | poin didapat jika berhasil |
| difficulty | integer | 1=pemula, 2=menengah, 3=mahir |
| active_date | date | tanggal challenge aktif |

### submissions
| kolom | tipe | keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| challenge_id | uuid | FK → challenges |
| ai_label | text | hasil deteksi Google Vision |
| ai_confidence | float | confidence score 0–1 |
| verified | boolean | true jika confidence ≥ 0.70 |

### quiz_questions
| kolom | tipe | keterangan |
|---|---|---|
| id | uuid | PK |
| question | text | teks soal |
| options | jsonb | ["A","B","C","D"] |
| correct_index | integer | index jawaban benar (0-based) |
| category | text | kategori sampah/lingkungan |
| difficulty | integer | 1–3 |

### quiz_history
| kolom | tipe | keterangan |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → profiles |
| question_id | uuid | FK → quiz_questions |
| is_correct | boolean | |

---

## Key Business Logic

### AI Waste Detection Flow (Google Cloud Vision)
1. User foto sampah via CameraCapture.tsx (MediaDevices API)
2. Frontend convert ke base64, POST ke /api/detect/
3. Server POST ke https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}
4. Request body: { requests: [{ image: { content: base64 }, features: [{ type: "LABEL_DETECTION", maxResults: 10 }] }] }
5. Parse response.responses[0].labelAnnotations → ambil description + score
6. Map label ke kategori sampah:
   - plastik: "plastic", "bottle", "bag", "container", "packaging", "plastic bottle"
   - kertas: "paper", "cardboard", "newspaper", "magazine", "carton"
   - logam: "metal", "tin", "aluminum", "can", "steel", "iron"
   - kaca: "glass", "jar" (jika tidak ada "plastic" di label sebelumnya)
   - organik: "food", "vegetable", "fruit", "organic", "leaf", "wood"
   - residu: fallback jika tidak ada match
7. Jika confidence >= 0.70 → verified = true → POST ke /api/points/ → tambah poin
8. Jika confidence < 0.70 → minta foto ulang, tampilkan tips

### Personalisasi Challenge
- Ambil submission history user dari tabel submissions
- Hitung error_rate per waste_category (submission gagal / total submission)
- Challenge harian diprioritaskan ke kategori dengan error_rate tertinggi
- Level difficulty naik setiap total_points kelipatan 50:
  - 0–49 poin → difficulty 1 (pemula)
  - 50–149 poin → difficulty 2 (menengah)
  - 150+ poin → difficulty 3 (mahir)

### Streak Logic
- Setiap kali user submit challenge verified = true, cek last_active
- Jika last_active = kemarin → streak_count + 1
- Jika last_active = hari ini → tidak berubah (sudah dihitung)
- Jika last_active > 1 hari lalu → streak_count = 1 (reset)
- Update last_active = today

### Level dari Poin
- Level 1: 0–49 poin
- Level 2: 50–149 poin
- Level 3: 150–299 poin
- Level 4: 300–499 poin
- Level 5: 500+ poin

---

## UI/UX Guidelines

### Visual Direction
- **Style**: UNESCO-editorial meets lingkungan — BUKAN "AI app template"
- **Prinsip**: Typography-driven, whitespace generous, clean, tidak ramai
- **Inspirasi**: UNESCO.org visual language — tapi lebih hidup dan interaktif

### Design Tokens
- **Warna primer**: Hijau tua (#15503a) — untuk hero, section gelap, aksen kuat
- **Warna sekunder**: Hijau medium (#22c55e) — untuk CTA, highlight, badge
- **Aksen**: Kuning (#facc15) — untuk reward, poin, hal yang celebratory
- **Background**: Putih (#FFFFFF) dan abu sangat muda (#f9fafb)
- **Teks**: Gelap (#1a1a1a) di atas putih, putih di atas hijau tua
- **Border radius**: rounded-2xl untuk card, rounded-full untuk badge/pill

### Typography
- **Headline besar**: Playfair Display (serif) — editorial, berkarakter, tidak generic
- **Body + UI**: Inter (sans-serif) — bersih, terbaca
- Import keduanya via next/font/google
- Headline landing: 64–72px desktop, 36–48px mobile
- Section label: uppercase, tracking-widest, 12–13px, warna hijau medium

### Hero Section (Landing Page)
- Background: YouTube video autoplay, muted, loop
- YouTube Video ID: voPkttQKe70
- iframe embed URL: https://www.youtube.com/embed/voPkttQKe70?autoplay=1&mute=1&loop=1&playlist=voPkttQKe70&controls=0&showinfo=0&rel=0&modestbranding=1
- Overlay: gradient gelap dari bawah (from-black/60 to-transparent)
- Konten: posisi bottom-left di atas video, teks putih
- Fallback: jika iframe tidak load, background hijau tua solid

### Animasi & Interaktivitas
- Fade-in-up saat section masuk viewport (Intersection Observer)
- Counter animasi untuk angka impact (0 → angka akhir, 2s duration)
- Smooth scroll untuk anchor links
- Hover state subtle pada semua elemen interaktif
- Feedback visual (bounce/pulse) saat user berhasil submit challenge

### Bahasa & Tone
- Bahasa Indonesia
- Untuk anak-anak: sapaan hangat ("Hei!", "Keren banget!", "Yuk mulai!")
- Untuk landing page: lebih editorial dan impactful ("Masa Depan Bumi Ada di Tanganmu")
- Hindari bahasa korporat dan terlalu formal

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GOOGLE_VISION_API_KEY=...     # Server-side only, jangan expose ke client
```

---

## Hal yang JANGAN Dilakukan
- JANGAN expose GOOGLE_VISION_API_KEY ke client/browser (hanya di API route server-side)
- JANGAN skip validasi confidence score — harus ≥ 0.70 di server, bukan client
- JANGAN gunakan localStorage untuk simpan data user — semua di Supabase
- JANGAN buat halaman baru tanpa update middleware.ts untuk proteksi route
- JANGAN hardcode API key di source code
- JANGAN pakai UI yang terkesan "AI-generated template" — harus editorial dan berkarakter
- JANGAN pakai warna generik atau font default — selalu Playfair Display + Inter
- JANGAN sebut "Roboflow" di kode manapun — AI provider kita adalah Google Cloud Vision

---

## Prioritas Build (urutan pengerjaan)
1. `src/lib/supabase.ts` — Supabase client browser + server
2. `src/lib/vision.ts` — Google Vision wrapper (detectWaste)
3. `src/lib/gamification.ts` — calculateLevel, getNextChallenge
4. `src/lib/content.ts` — hardcode EcoFacts + quiz questions
5. `src/middleware.ts` — route protection
6. `src/app/page.tsx` — landing page (hero video + UNESCO style)
7. `src/app/(auth)/login` + `register` — auth pages
8. `src/app/dashboard/page.tsx` — dashboard user
9. `src/app/challenge/page.tsx` + `src/components/CameraCapture.tsx`
10. `src/api/detect/route.ts` + `src/api/points/route.ts`
11. `src/app/ecofacts/page.tsx` + `src/app/quiz/page.tsx`
12. Polish + deploy Vercel
