-- Tabel cache EcoFacts harian (FASE 9).
-- Fakta lingkungan di-generate dinamis oleh Anthropic Claude lalu disimpan di
-- sini per tanggal, supaya 1 hari hanya 1 kali hit ke Anthropic API.
-- Jalankan SEKALI di Supabase SQL Editor.

create table if not exists public.ecofacts_cache (
  id uuid primary key default gen_random_uuid(),
  facts jsonb not null,
  generated_date date unique not null,
  created_at timestamptz default now()
);

alter table public.ecofacts_cache enable row level security;

-- Cache bersifat publik (bukan data per-user). Semua user login boleh membaca
-- dan menulis cache harian lewat route handler (anon key + session).
drop policy if exists "ecofacts_cache read" on public.ecofacts_cache;
create policy "ecofacts_cache read"
  on public.ecofacts_cache
  for select
  to authenticated
  using (true);

drop policy if exists "ecofacts_cache insert" on public.ecofacts_cache;
create policy "ecofacts_cache insert"
  on public.ecofacts_cache
  for insert
  to authenticated
  with check (true);
