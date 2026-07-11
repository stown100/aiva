import { AppHeader } from "@/widgets/app-header";

import { BenefitsSection } from "./benefits-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { LandingFooter } from "./landing-footer";
import { PricingTeaserSection } from "./pricing-teaser-section";
import { StylesShowcaseSection } from "./styles-showcase-section";

export function LandingPage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <StylesShowcaseSection />
        <BenefitsSection />
        <PricingTeaserSection />
      </main>
      <LandingFooter />
    </>
  );
}
