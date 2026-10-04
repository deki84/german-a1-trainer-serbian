import type { MetadataRoute } from "next";

// Macht die App installierbar: Symbol auf dem Startbildschirm, öffnet sich ohne Browserleisten
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nemački korak po korak",
    short_name: "Nemački",
    description: "Učimo nemački: jedna reč, pa jedno pitanje.",
    lang: "sr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f6f7f4",
    theme_color: "#0e4d64",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
