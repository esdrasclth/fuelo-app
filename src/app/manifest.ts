import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fuelo — Gestión de Combustible",
    short_name: "Fuelo",
    description:
      "Registra cargas de combustible, analiza tu rendimiento y estima el costo de tus trayectos.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#f5f5f5",
    orientation: "portrait",
    lang: "es-MX",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
