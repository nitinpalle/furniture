import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { brand } from "@/lib/brand";
import { getNavCategories, PROJECT_TYPES } from "@/lib/nav-data";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
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
        <Navbar categories={categories} projectTypes={PROJECT_TYPES} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
