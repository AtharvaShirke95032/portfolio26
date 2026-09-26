import type { Metadata } from "next";
import { Inter, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "atharva shirke — full-stack developer",
  description:
    "Backend-focused full-stack developer building scalable APIs with Node.js, Express and React. Builder of Outly and README-AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} ${caveat.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
