import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });

const description =
  "Backend-focused full-stack developer building scalable APIs with Node.js, Express and React. Builder of Outly and README-AI.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "atharva shirke — full-stack developer",
  description,
  authors: [{ name: "Atharva Shirke", url: siteUrl }],
  keywords: ["Atharva Shirke", "full-stack developer", "backend developer", "Node.js", "Express", "React", "Next.js", "portfolio"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "atharva shirke",
    title: "atharva shirke — full-stack developer",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "atharva shirke — full-stack developer",
    description,
  },
};

// browser chrome (mobile address bar etc.) — light by default; the theme toggle swaps it
export const viewport: Viewport = {
  themeColor: "#f4f4f3",
};

// runs before first paint so someone who picked dark never sees a white flash.
// light for everyone by default (ignores the os setting); a saved choice from the toggle wins.
const themeScript = `try{var t=localStorage.getItem("theme")==="dark"?"dark":"light";document.documentElement.dataset.theme=t;if(t==="dark")addEventListener("DOMContentLoaded",function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.content="#121214"})}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} ${caveat.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
