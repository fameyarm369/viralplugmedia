import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Viral Plug Media | Media-Reactive Comic Marketing & CRM Ecosystem",
  description:
    "High-performance digital platform and marketing engine powered by real client photography and the Media-Reactive Comic Poster Design Engine. Scaling properties, food & honey brands, sports gear, fashion, and local retail.",
  keywords: [
    "Viral Plug Media",
    "Performance Marketing",
    "Comic Poster Ad Engine",
    "D2C Brand Growth",
    "Real Estate Lead Generation",
    "Sports Drops",
    "WhatsApp CRM India",
  ],
  authors: [{ name: "Viral Plug Media Team" }],
  openGraph: {
    title: "Viral Plug Media | Real Media. Unstoppable Viral Reach.",
    description:
      "Media-Reactive Comic Poster Design Engine turning real brand photos and videos into high-converting viral ad powerhouses.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-comic-black text-white antialiased font-body selection:bg-comic-yellow selection:text-comic-black">
        {children}
      </body>
    </html>
  );
}
