-- 0002_add_category_color.sql
-- Menambahkan kolom warna kustom untuk tiap kategori (dipakai untuk warna titik marker di peta).

alter table categories
  add column if not exists color text not null default '#f97316';

-- Pastikan formatnya selalu hex color yang valid, mis. #f97316
alter table categories
  add constraint categories_color_hex_check
  check (color ~* '^#[0-9a-f]{6}$');
