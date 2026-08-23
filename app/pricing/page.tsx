import type { Metadata } from "next";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { PRODUCT_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Plans — ${PRODUCT_NAME}`,
  description: "Subscribe to AI Olympiad Single, Compare, or Pro. Checkout via Stripe — add API keys after.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
