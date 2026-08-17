import type { MetadataRoute } from "next";
import { PRODUCT_NAME, PRODUCT_SHORT } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: PRODUCT_NAME,
    short_name: PRODUCT_SHORT,
    description: "BYOK multi-model AI compare. Coach routing, Podium judging, local vault.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1A1D21",
    theme_color: "#1A1D21",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
