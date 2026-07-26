-- seed.sql
-- 5 kategori contoh + minimal 1 lokasi nyata per kategori di Kecamatan Kebomas.
-- Koordinat adalah perkiraan yang masuk akal dalam bounding box kecamatan
-- (minLng 112.5774, maxLng 112.6763, minLat -7.2087, maxLat -7.1490) — cek dan
-- sesuaikan presisinya dengan data lapangan sebelum go-live.

insert into categories (name, icon) values
  ('Kantor Pemerintahan', 'Landmark'),
  ('Pusat Kesehatan', 'HeartPulse'),
  ('Pendidikan', 'GraduationCap'),
  ('Posyandu', 'Users'),
  ('Kantor Polisi', 'Shield')
on conflict do nothing;

-- Kantor Pemerintahan
insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'Kantor Kecamatan Kebomas',
  'Jl. Kepatihan No. 1, Kebomas, Kec. Kebomas, Kabupaten Gresik, Jawa Timur',
  'Kantor kecamatan yang melayani administrasi kependudukan dan perizinan warga Kebomas.',
  -7.1618, 112.6376
from categories where name = 'Kantor Pemerintahan';

-- Pusat Kesehatan
insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'RS Semen Gresik',
  'Jl. R.A Kartini No. 280, Kembangan, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61111',
  'Rumah sakit umum dengan layanan IGD 24 jam, rawat inap, dan poli spesialis.',
  -7.1565, 112.6395
from categories where name = 'Pusat Kesehatan';

insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'RS Petrokimia Gresik',
  'Jl. Jenderal Ahmad Yani, Karangturi, Kec. Gresik, Kabupaten Gresik, Jawa Timur',
  'Rumah sakit swasta dengan layanan umum dan spesialis untuk warga Gresik dan sekitarnya.',
  -7.1522, 112.6427
from categories where name = 'Pusat Kesehatan';

insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'Puskesmas Kebomas',
  'Jl. Kepatihan, Kebomas, Kec. Kebomas, Kabupaten Gresik, Jawa Timur',
  'Puskesmas rawat jalan yang melayani warga Kelurahan Kebomas dan sekitarnya.',
  -7.1635, 112.6362
from categories where name = 'Pusat Kesehatan';

-- Pendidikan
insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'SMA Negeri 1 Kebomas',
  'Jl. Proklamasi, Kebomas, Kec. Kebomas, Kabupaten Gresik, Jawa Timur',
  'Sekolah menengah atas negeri di wilayah Kebomas.',
  -7.1690, 112.6340
from categories where name = 'Pendidikan';

-- Posyandu
insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'Posyandu Melati Kelurahan Kebomas',
  'Kelurahan Kebomas, Kec. Kebomas, Kabupaten Gresik, Jawa Timur',
  'Pos pelayanan terpadu untuk kesehatan ibu dan anak, buka setiap tanggal 10.',
  -7.1608, 112.6398
from categories where name = 'Posyandu';

-- Kantor Polisi
insert into locations (category_id, name, address, description, latitude, longitude)
select id, 'Polsek Kebomas',
  'Jl. Dr. Wahidin Sudirohusodo, Kebomas, Kec. Kebomas, Kabupaten Gresik, Jawa Timur',
  'Kantor kepolisian sektor yang melayani wilayah Kecamatan Kebomas.',
  -7.1655, 112.6412
from categories where name = 'Kantor Polisi';
