import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import { TabBar } from "@/components/TabBar";
import { ClerkProvider } from "@clerk/nextjs";
import { srRS } from "@clerk/localizations";

/**
 * Atkinson Hyperlegible wurde für gute Lesbarkeit entwickelt.
 * "latin-ext" ist nötig für serbische Buchstaben wie č, ć, š, ž, đ.
 */
const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nemački korak po korak",
  description: "Učimo nemački: jedna reč, pa jedno pitanje.",
  appleWebApp: { capable: true, title: "Nemački", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1a20" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider localization={srRS}>
      <html lang="sr">
        <body className={`${atkinson.className} bg-bg text-ink antialiased`}>
          <TabBar />
          <div className="pb-28">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
