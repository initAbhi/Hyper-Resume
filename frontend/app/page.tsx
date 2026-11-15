import React from 'react';
import { LandingHero } from '@/components/home/LandingHero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { StickyMobileCta } from '@/components/home/StickyMobileCta';
import { SmoothScroll } from '@/components/home/SmoothScroll';
import { CompanyLogoCloud } from '@/components/home/CompanyLogoCloud';
import { AtsCompatibilityCloud } from '@/components/home/AtsCompatibilityCloud';
import { AtsScoreShowcase } from '@/components/home/AtsScoreShowcase';
import { ProductFeaturesTabs } from '@/components/home/ProductFeaturesTabs';
import { ProductWorkflowStorytelling } from '@/components/home/ProductWorkflowStorytelling';
import { InteractiveTemplateShowcase } from '@/components/home/InteractiveTemplateShowcase';
import { SampleLibraryShowcase } from '@/components/home/SampleLibraryShowcase';
import { ApplicationPipelineWorkspace } from '@/components/home/ApplicationPipelineWorkspace';
import { CareerLoopSection } from '@/components/home/CareerLoopSection';
import { DifferentiatorSection } from '@/components/home/DifferentiatorSection';
import { CredibilityAndTrustSection } from '@/components/home/CredibilityAndTrustSection';
import { PricingSection } from '@/components/home/PricingSection';
import { FaqAndFinalCta } from '@/components/home/FaqAndFinalCta';

export default function HomePage() {
  return (
    <div className="landing-page relative flex min-h-screen w-full flex-col items-center overflow-x-hidden bg-[#0a0a0a] text-white selection:bg-[#5525F5]/30 selection:text-white">
      <SmoothScroll />
      <LandingHero />
      <TrustStrip />

      <section className="relative z-10 w-full bg-[#0a0a0a] py-6 sm:py-8">
        <CompanyLogoCloud />
      </section>

      <section className="relative z-10 w-full bg-[#0a0a0a] py-2">
        <AtsCompatibilityCloud />
      </section>

      <div className="relative z-10 w-full">
        <AtsScoreShowcase />
      </div>

      <div className="relative z-10 w-full">
        <ProductWorkflowStorytelling />
      </div>

      <div id="product-workspace" className="relative z-10 w-full scroll-mt-24">
        <ProductFeaturesTabs />
      </div>

      <section
        id="templates"
        className="relative z-10 w-full scroll-mt-24 bg-[#0a0a0a] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <InteractiveTemplateShowcase />
        </div>
      </section>

      <div className="relative z-10 w-full">
        <SampleLibraryShowcase />
      </div>

      <div className="relative z-10 w-full">
        <ApplicationPipelineWorkspace />
      </div>

      <div className="relative z-10 w-full">
        <CareerLoopSection />
      </div>

      <div className="relative z-10 w-full">
        <DifferentiatorSection />
      </div>

      <div className="relative z-10 w-full">
        <CredibilityAndTrustSection />
      </div>

      {/* Pricing intentionally unchanged */}
      <div className="relative z-10 w-full">
        <PricingSection />
      </div>

      <div className="relative z-10 w-full pb-20 sm:pb-0">
        <FaqAndFinalCta />
      </div>

      <StickyMobileCta />
    </div>
  );
}
