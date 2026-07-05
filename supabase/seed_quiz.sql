-- Seed quiz_questions dari src/lib/content.ts (15 soal)
-- Jalankan SEKALI di Supabase SQL Editor (service role bypass RLS).
-- Aman diulang: hapus dulu lalu insert ulang.

delete from quiz_questions;

insert into quiz_questions (question, options, correct_index, category, difficulty) values
  ('Botol air mineral plastik sebaiknya dibuang ke tempat sampah kategori apa?', '["Organik","Plastik","Kertas","Logam"]'::jsonb, 1, 'Pemilahan Sampah', 1),
  ('Sisa kulit pisang termasuk jenis sampah apa?', '["Organik","Plastik","Kaca","Residu"]'::jsonb, 0, 'Pemilahan Sampah', 1),
  ('Kaleng minuman bekas paling tepat masuk ke kategori...', '["Kertas","Kaca","Logam","Organik"]'::jsonb, 2, 'Pemilahan Sampah', 1),
  ('Manakah yang termasuk sampah yang bisa didaur ulang?', '["Sisa makanan basi","Botol kaca","Tisu bekas","Popok sekali pakai"]'::jsonb, 1, 'Daur Ulang', 1),
  ('Apa kepanjangan prinsip 3R dalam pengelolaan sampah?', '["Reduce, Reuse, Recycle","Read, Run, Rest","Reduce, Repeat, Return","Reuse, Reduce, Repair"]'::jsonb, 0, 'Daur Ulang', 1),
  ('Mengubah sampah organik menjadi pupuk alami disebut...', '["Insinerasi","Pengomposan","Sublimasi","Filtrasi"]'::jsonb, 1, 'Organik', 1),
  ('Kira-kira berapa lama botol plastik terurai di alam?', '["1 tahun","10 tahun","100 tahun","Ratusan tahun"]'::jsonb, 3, 'Dampak Lingkungan', 1),
  ('Hewan laut yang sering keliru menelan kantong plastik karena dikira ubur-ubur adalah...', '["Penyu","Hiu","Lumba-lumba","Bintang laut"]'::jsonb, 0, 'Dampak Lingkungan', 1),
  ('Manakah tindakan yang paling baik untuk mengurangi sampah plastik?', '["Membeli air kemasan setiap hari","Membawa botol minum sendiri","Memakai sedotan plastik","Membungkus makanan dengan plastik"]'::jsonb, 1, 'Pengurangan Sampah', 1),
  ('Lampu yang tidak dipakai sebaiknya...', '["Dibiarkan menyala","Dimatikan","Diganti tiap hari","Dinyalakan lebih terang"]'::jsonb, 1, 'Energi', 1),
  ('Toples kaca bekas selai paling baik kita...', '["Pecahkan lalu buang","Pakai ulang untuk wadah","Bakar","Kubur di tanah"]'::jsonb, 1, 'Daur Ulang', 1),
  ('Sampah yang tidak bisa didaur ulang maupun dikompos disebut sampah...', '["Organik","Residu","Plastik","Logam"]'::jsonb, 1, 'Pemilahan Sampah', 1),
  ('Kertas bekas sebaiknya kita...', '["Buang ke sungai","Daur ulang","Bakar di halaman","Campur dengan sisa makanan"]'::jsonb, 1, 'Daur Ulang', 1),
  ('Kebiasaan hemat air yang benar saat menyikat gigi adalah...', '["Membiarkan keran menyala","Menutup keran saat menyikat","Memakai air panas terus","Menyikat di bawah keran mengalir"]'::jsonb, 1, 'Air', 1),
  ('Mengapa sampah harus dipilah dari rumah?', '["Agar lebih mudah didaur ulang","Supaya tempat sampah penuh","Agar bau lebih menyengat","Tidak ada gunanya"]'::jsonb, 0, 'Pemilahan Sampah', 1);
