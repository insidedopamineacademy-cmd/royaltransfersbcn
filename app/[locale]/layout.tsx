import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { locales, type Locale } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "../globals.css";

import GTM from "@/components/GTM";
export const metadata: Metadata = {
  metadataBase: new URL("https://royaltransfersbcn.com"),
  title: {
    default:
      "Royal Transfers BCN | Premium Chauffeur & Airport Transfers Barcelona",
    template: "%s | Royal Transfers BCN",
  },
  description:
    "Book premium chauffeur and airport transfers in Barcelona with Royal Transfers BCN. Luxury vehicles, professional drivers, fixed pricing, and instant confirmation.",
  keywords: [
    "Barcelona airport transfer",
    "chauffeur Barcelona",
    "luxury transfer Barcelona",
    "private transfer Barcelona",
    "Barcelona chauffeur service",
    "airport transfer BCN",
    "Royal Transfers BCN",
  ],
  openGraph: {
    title:
      "Royal Transfers BCN | Premium Chauffeur & Airport Transfers Barcelona",
    description:
      "Premium private transfers and chauffeur services in Barcelona. Professional drivers, luxury vehicles, and seamless booking.",
    url: "https://royaltransfersbcn.com",
    siteName: "Royal Transfers BCN",
    locale: "en_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Transfers BCN",
    description:
      "Premium chauffeur and airport transfer services in Barcelona.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col bg-neutral-950 text-white antialiased">
        <GTM />

        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
