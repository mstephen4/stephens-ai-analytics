import type { Metadata } from "next";
import { AboutContent } from "@/components/about/AboutContent";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About — ${PRODUCT_NAME}`,
  description:
    "About AI Olympiad — BYOK multi-model compare, Podium judging, Coach routing, and local-first privacy.",
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <SiteHeader current="about" />
      <main className="about-page-main">
        <AboutContent />
      </main>
    </div>
  );
}
