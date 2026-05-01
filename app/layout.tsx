import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { brand } from "@/lib/brand";
import { getNavCategories, PROJECT_TYPES } from "@/lib/nav-data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { HideOnAdmin } from "@/components/layout/HideOnAdmin";
import { InViewReveal } from "@/components/home/InViewReveal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.tagline,
  metadataBase: new URL(brand.siteUrl),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getNavCategories();

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col">
        <InViewReveal />
        <HideOnAdmin>
          <Navbar categories={categories} projectTypes={PROJECT_TYPES} />
        </HideOnAdmin>
        <main className="flex-1">{children}</main>
        <HideOnAdmin>
          <Footer categories={categories} />
          <FloatingWhatsApp />
        </HideOnAdmin>
        <SearchOverlay />
      </body>
    </html>
  );
}
