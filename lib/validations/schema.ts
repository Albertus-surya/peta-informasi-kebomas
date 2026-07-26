import { z } from "zod";

// Bounding box Kecamatan Kebomas + padding ±0.005°, dipakai sebagai fallback.
// BoundaryLayer menghitung bbox sebenarnya dari GeoJSON saat runtime dan bisa
// dipakai untuk override nilai ini lewat props jika diperlukan validasi dinamis.
export const KEBOMAS_BOUNDS = {
  minLng: 112.5774 - 0.005,
  maxLng: 112.6763 + 0.005,
  minLat: -7.2087 - 0.005,
  maxLat: -7.149 + 0.005,
};

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(50),
  icon: z.string().min(1, "Pilih salah satu ikon"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const locationSchema = z.object({
  category_id: z.string().uuid("Pilih kategori"),
  name: z.string().min(2, "Nama lokasi minimal 2 karakter").max(120),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  description: z.string().max(1000).optional().or(z.literal("")),
  latitude: z
    .number({ invalid_type_error: "Latitude harus berupa angka" })
    .min(
      KEBOMAS_BOUNDS.minLat,
      "Latitude di luar wilayah Kecamatan Kebomas"
    )
    .max(
      KEBOMAS_BOUNDS.maxLat,
      "Latitude di luar wilayah Kecamatan Kebomas"
    ),
  longitude: z
    .number({ invalid_type_error: "Longitude harus berupa angka" })
    .min(
      KEBOMAS_BOUNDS.minLng,
      "Longitude di luar wilayah Kecamatan Kebomas"
    )
    .max(
      KEBOMAS_BOUNDS.maxLng,
      "Longitude di luar wilayah Kecamatan Kebomas"
    ),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
