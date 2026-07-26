import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Peta Informasi Kebomas",
  description:
    "Sistem informasi geografis lokasi-lokasi penting di Kecamatan Kebomas, Kabupaten Gresik, Jawa Timur — kantor pemerintahan, pusat kesehatan, pendidikan, posyandu, dan kantor polisi.",
  openGraph: {
    title: "Peta Informasi Kebomas",
    description:
      "Temukan lokasi fasilitas publik di Kecamatan Kebomas, Kabupaten Gresik dengan mudah.",
    images: ["/images/og-image.png"],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#1c1917",
              color: "#f5f4f2",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
