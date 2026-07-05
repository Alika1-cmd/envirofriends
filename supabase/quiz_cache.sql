-- Tabel cache Quiz harian (FASE 11).
-- Soal kuis di-generate dinamis oleh Anthropic Claude lalu disimpan per tanggal,
-- supaya 1 hari hanya 1 kali hit ke Anthropic API.
-- Jalankan SEKALI di Supabase SQL Editor.

create table if not exists public.quiz_cache (
  id uuid primary key default gen_random_uuid(),
  questions jsonb not null,
  generated_date date unique not null,
  created_at timestamptz default now()
);

alter table public.quiz_cache enable row level security;

drop policy if exists "Authenticated can read quiz cache" on public.quiz_cache;
create policy "Authenticated can read quiz cache"
  on public.quiz_cache
  for select
  using (auth.role() = 'authenticated');

drop policy if exists "Authenticated can insert quiz cache" on public.quiz_cache;
create policy "Authenticated can insert quiz cache"
  on public.quiz_cache
  for insert
  with check (auth.role() = 'authenticated');

-- Soal kuis sekarang di-generate AI (tidak ada di tabel quiz_questions), jadi
-- foreign key quiz_history.question_id -> quiz_questions harus dilepas agar
-- hasil kuis harian tetap bisa disimpan ke quiz_history.
alter table public.quiz_history
  drop constraint if exists quiz_history_question_id_fkey;
