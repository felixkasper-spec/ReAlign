import type { Metadata, Viewport } from "next";
import { Newsreader, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import CookieConsent from "@/components/CookieConsent";
import "./globals.css";

const GTM_ID = "GTM-K7H75K8X";

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
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* Måste köra innan GTM-snuttens gtm.js hinner ladda och några
            taggar hinner fira, annars hinner de fira okontrollerat innan
            samtycke finns — beforeInteractive garanterar det oavsett var
            i trädet den här komponenten placeras. */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
          window.gtag=gtag;
          gtag('consent','default',{
            ad_storage:'denied',
            ad_user_data:'denied',
            ad_personalization:'denied',
            analytics_storage:'denied',
            wait_for_update:500
          });`}
        </Script>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
