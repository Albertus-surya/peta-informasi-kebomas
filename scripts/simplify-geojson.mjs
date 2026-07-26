/**
 * scripts/simplify-geojson.mjs
 *
 * Menyederhanakan geometry boundary Kecamatan Kebomas agar lebih ringan
 * saat di-render di browser (Leaflet). Memakai mapshaper (via CLI) untuk
 * simplifikasi topology-aware, lalu @turf/turf untuk validasi bbox hasilnya.
 *
 * Input : public/geojson/kebomas-boundary.geojson
 * Output: public/geojson/kebomas-boundary.min.geojson  <-- pakai file ini di produksi
 *
 * Jalankan: npm run simplify-geojson
 * (memerlukan `mapshaper` sebagai devDependency — sudah ada di package.json)
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import * as turf from "@turf/turf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const INPUT = path.join(root, "public/geojson/kebomas-boundary.geojson");
const OUTPUT = path.join(root, "public/geojson/kebomas-boundary.min.geojson");

// Toleransi simplifikasi. Mapshaper pakai persentase titik yang dipertahankan,
// jadi kita konversi target toleransi sudut (~0.0001 derajat) ke opsi -simplify.
const SIMPLIFY_PERCENT = "12%"; // sesuaikan jika hasil masih terlalu detail/kasar

function main() {
  if (!existsSync(INPUT)) {
    console.error(
      `[simplify-geojson] File input tidak ditemukan: ${INPUT}\n` +
        `Letakkan Kecamatan_Kebomas-KEL_DESA.geojson di path tersebut terlebih dahulu.`
    );
    process.exit(1);
  }

  console.log("[simplify-geojson] Menjalankan mapshaper...");
  execSync(
    `npx mapshaper "${INPUT}" -simplify dp ${SIMPLIFY_PERCENT} keep-shapes -clean -o format=geojson "${OUTPUT}"`,
    { stdio: "inherit" }
  );

  const original = JSON.parse(readFileSync(INPUT, "utf-8"));
  const simplified = JSON.parse(readFileSync(OUTPUT, "utf-8"));

  const bboxOriginal = turf.bbox(original);
  const bboxSimplified = turf.bbox(simplified);

  console.log("[simplify-geojson] Selesai.");
  console.log("  bbox asli      :", bboxOriginal);
  console.log("  bbox setelah   :", bboxSimplified);
  console.log(
    "  jumlah fitur   :",
    original.features?.length,
    "->",
    simplified.features?.length
  );
  console.log(`  output ditulis ke: ${path.relative(root, OUTPUT)}`);
}

main();
