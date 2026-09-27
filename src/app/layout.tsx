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

// browser chrome (mobile address bar etc.) matches the page in both themes
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f3" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
};

// runs before first paint so a dark-mode visitor never sees a white flash.
// saved choice wins; otherwise follow the os setting.
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

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
