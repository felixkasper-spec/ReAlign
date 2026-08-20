import type { Metadata } from "next";
import { Newsreader, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Hållning — Postural träning",
  description:
    "Postural träning som återställer kroppens naturliga balans. Program, övningsbank och ergonomiguider, helt gratis.",
  openGraph: {
    title: "ReAlign Metoden — Hållningsträning som håller",
    description:
      "Postural träning som återställer kroppens naturliga balans. Program, övningsbank och ergonomiguider, helt gratis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="sv">
      <body
        className={`${newsreader.variable} ${publicSans.variable} ${plexMono.variable}`}
        style={{ fontFamily: "var(--font-public-sans), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
