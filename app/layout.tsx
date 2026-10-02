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
};

// viewportFit "cover" nutzt beim iPhone den ganzen Bildschirm (Notch)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
