import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZMind",
  description: "Your AI-powered web clipping archive",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icon-32.png", sizes: "32x32" },
    { rel: "icon", url: "/icon-192.png", sizes: "192x192" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
};

export const viewport: Viewport = {
  themeColor: "#0A0A12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
