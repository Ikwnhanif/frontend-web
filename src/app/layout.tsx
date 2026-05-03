import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. Pengaturan Viewport (Warna bar atas browser/HP)
export const viewport: Viewport = {
  themeColor: "#EA580C", // Warna orange sesuai tema aplikasi
};

// 2. Pengaturan Metadata & PWA Icons
export const metadata: Metadata = {
  title: "MIE SPECIALL",
  description: "Management System for Mie Supplier & Assets",
  manifest: "/manifest.json", // Memanggil file manifest
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" }, // Logo wajib untuk layar Home iPhone/iPad
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
