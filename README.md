# Peta Informasi Kebomas

Sistem informasi geografis (GIS) berbasis web untuk menampilkan lokasi-lokasi
penting di Kecamatan Kebomas, Kabupaten Gresik, Jawa Timur, lengkap dengan
dashboard admin.

**Stack:** Next.js 14 (App Router) · React · TypeScript · Tailwind CSS ·
Leaflet.js + react-leaflet · Supabase (Postgres + Auth + RLS) · Cloudinary ·
Zod + React Hook Form · Zustand · Vercel

---

## 1. Setup lokal

```bash
npm install
cp .env.example .env.local
# isi .env.local dengan kredensial Supabase & Cloudinary Anda
npm run dev
```

Buka `http://localhost:3000`.

### Ganti file GeoJSON placeholder

File di `public/geojson/` saat ini masih placeholder. Timpa dengan file asli
Anda (`Kecamatan_Kebomas-KEL_DESA.geojson` →
`public/geojson/kebomas-boundary.geojson`, dan
`Kelurahan_Kebomas-KEL_DESA.geojson` →
`public/geojson/kelurahan-kebomas-highlight.geojson`), lalu jalankan:
   
```bash
npm run simplify-geojson
```

Ini menghasilkan `kebomas-boundary.min.geojson` yang dipakai di produksi.
Detail lengkap ada di `public/geojson/README.md`.

---

## 2. Setup Supabase (wajib sebelum deploy pertama)

1. Buat project baru di [supabase.com](https://supabase.com).
2. Di **SQL Editor**, jalankan isi `supabase/migrations/0001_init.sql`
   (membuat tabel `categories` & `locations`, trigger `updated_at`, index,
   dan RLS policy).
3. Jalankan `supabase/seed.sql` untuk mengisi 5 kategori contoh + lokasi awal
   (boleh dilewati jika ingin mulai dari data kosong).
4. Buat user admin pertama lewat **Authentication > Users > Add user** (email
   + password) — ini akun untuk login ke `/admin/login`.
5. (Opsional) Regenerasi tipe TypeScript setelah skema berubah:
   ```bash
   npx supabase gen types typescript --project-id <project-id> > types/database.ts
   ```

Jika memakai Supabase CLI, langkah 2–3 juga bisa lewat:

```bash
supabase link --project-ref <project-id>
supabase db push
supabase db execute -f supabase/seed.sql
```

---

## 3. Setup Cloudinary  

1. Buat akun di [cloudinary.com](https://cloudinary.com), catat **Cloud
   name**.
2. Buka **Settings > Upload > Upload presets > Add upload preset**:
   - Signing mode: **Unsigned**
   - Incoming transformation: `w_1200,c_limit,f_webp,q_auto` (auto-resize
     max width 1200px, convert ke WebP)
3. Catat nama preset untuk `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

---

## 4. Deploy ke Vercel

1. Push repo ke GitHub, lalu import project di [vercel.com/new](https://vercel.com/new).
2. Isi environment variable berikut di **Project Settings > Environment
   Variables** (Production & Preview):

   | Key | Isi dengan |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key Supabase |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Nama unsigned upload preset |

3. Pastikan migration & seed Supabase (bagian 2) sudah dijalankan **sebelum**
   deploy pertama, supaya halaman publik tidak menampilkan error saat fetch
   data.
4. Klik **Deploy**. CI/CD otomatis berjalan setiap push ke branch utama.
5. Setelah deploy, buka `/admin/login` dan masuk dengan akun admin yang
   dibuat di langkah Supabase.

---

## 5. Struktur folder

```
/app                      route Next.js App Router (publik + admin)
/components/map           MapView, BoundaryLayer, HighlightLayer, MarkerLayer
/components/sidebar       CategoryAccordion, SearchBar, MobileBottomSheet
/components/admin         LocationForm, LocationTable, CategoryManager, dll
/lib/supabase             client & server Supabase client
/lib/cloudinary           helper unsigned upload
/lib/store                Zustand store (selectedLocation, mapCenter, dll)
/lib/validations          skema Zod
/scripts                  simplify-geojson.mjs
/supabase                 migration & seed SQL
/public/geojson           boundary GeoJSON (ganti dengan data asli)
```
