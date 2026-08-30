import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.realignmetoden.se"),
  title: "Hållning — ReAlign Metoden",
  description:
    "Postural träning som återställer kroppens naturliga balans. Program och ergonomiguider, helt gratis att komma igång med.",
  openGraph: {
    title: "ReAlign Metoden — Hållningsträning som håller",
    description:
      "Postural träning som återställer kroppens naturliga balans. Program och ergonomiguider, helt gratis att komma igång med.",
    type: "website",
    images: ["/og/default.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/default.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ReAlign Metoden",
  url: "https://www.realignmetoden.se",
  logo: "https://www.realignmetoden.se/logo.png",
  description:
    "Postural träning som återställer kroppens naturliga balans — program, ergonomiguider och strukturerad progression.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "kontakt@realignmetoden.se",
    contactType: "customer service",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
