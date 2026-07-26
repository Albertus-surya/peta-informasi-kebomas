# File GeoJSON — WAJIB diganti sebelum deploy

File di folder ini (`kebomas-boundary.geojson` dan `kelurahan-kebomas-highlight.geojson`)
saat ini masih **placeholder** (persegi sederhana), bukan boundary asli.

Langkah mengganti dengan data asli Anda:

1. Timpa `kebomas-boundary.geojson` dengan file asli
   `Kecamatan_Kebomas-KEL_DESA.geojson` (21 fitur, Kelurahan + Desa).
2. Timpa `kelurahan-kebomas-highlight.geojson` dengan file asli
   `Kelurahan_Kebomas-KEL_DESA.geojson` (1 fitur, polygon Kelurahan Kebomas).
3. Jalankan `npm run simplify-geojson` untuk menghasilkan
   `kebomas-boundary.min.geojson` — file inilah yang dipakai `<BoundaryLayer />`
   di produksi (lihat `components/map/BoundaryLayer.tsx`).
4. `<BoundaryLayer />` dan `<HighlightLayer />` menghitung bounding box secara
   otomatis dari isi file (pakai `@turf/bbox`) — tidak ada angka yang di-hardcode,
   jadi tidak perlu ubah kode apa pun setelah file diganti.
