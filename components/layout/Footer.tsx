import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex shrink-0 flex-col items-center gap-1 border-t border-ink-300 bg-white px-4 py-3 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="flex items-center gap-2">
        {/* Logo sementara — ganti /public/images/logo-placeholder.svg dengan logo resmi */}
        <Image
          src="/images/kebomas.jpg"
          alt="Logo Kecamatan Kebomas"
          width={24}
          height={24}
          className="opacity-70"
        />
        <span className="text-xs font-medium text-ink-700">
          Peta Informasi Kebomas
        </span>
      </div>
      <p className="text-xs text-ink-500">
        © {new Date().getFullYear()} Kecamatan Kebomas, Kabupaten Gresik.
        Data lokasi dapat berubah sewaktu-waktu.
      </p>
    </footer>
  );
}
