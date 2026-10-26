import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrendingNow",
  description: "Evidence-backed product decisions for Etsy sellers",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <div className="shell">
          <nav className="nav">
            <Link href="/" className="brand">TrendingNow</Link>
            <Link href="/">Opportunities</Link>
            <Link href="/store">Store profile</Link>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
