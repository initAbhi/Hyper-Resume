import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveHeroStudio } from '@/components/home/InteractiveHeroStudio';
import { AtsCompatibilitySection } from '@/components/home/AtsCompatibilitySection';
import { ProductWorkflowStorytelling } from '@/components/home/ProductWorkflowStorytelling';
import { InteractiveTemplateShowcase } from '@/components/home/InteractiveTemplateShowcase';
import { SampleLibraryShowcase } from '@/components/home/SampleLibraryShowcase';
import { ApplicationPipelineWorkspace } from '@/components/home/ApplicationPipelineWorkspace';
import { CredibilityAndTrustSection } from '@/components/home/CredibilityAndTrustSection';
import { PricingSection } from '@/components/home/PricingSection';
import { FaqAndFinalCta } from '@/components/home/FaqAndFinalCta';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden bg-white dark:bg-[#0C0D13] text-[#171923] dark:text-[#F0F2F5] selection:bg-[#3730F5]/10 selection:text-[#3730F5]">
      
      {/* =====================================================
          1. HERO SECTION (Asymmetric Editorial Layout)
      ===================================================== */}
      <section className="relative w-full pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Strong Editorial Positioning & CTAs */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F7F8FA] dark:bg-[#1A1D23] border border-[#E6E8ED] dark:border-[#252A33] text-[#626B7A] dark:text-[#9EA7B4] text-xs font-semibold tracking-wider uppercase font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3730F5] dark:bg-blue-400 animate-pulse" />
                <span>Purposeful Resume Architecture</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-bold tracking-tight text-[#171923] dark:text-[#F0F2F5] leading-[1.12]">
                A better resume for the specific job you want.
              </h1>

              {/* Supporting Copy */}
              <p className="text-sm sm:text-base text-[#626B7A] dark:text-[#9EA7B4] leading-relaxed max-w-xl">
                Turn your verified experience into targeted, ATS-conscious applications with evidence-backed suggestions and transparent job requirement matching.
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-md bg-[#3730F5] hover:bg-[#2820D4] text-white font-semibold text-sm h-11 px-7 shadow-xs gap-2">
                    <span>Build My Resume — Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/tools/resume-checker" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-md text-sm font-semibold h-11 px-6 hover:border-[#3730F5]">
                    <span>Try Free ATS Checker</span>
                  </Button>
                </Link>
              </div>

              {/* Trust-Oriented Product Attributes */}
              <div className="pt-3 border-t border-[#E6E8ED] dark:border-[#252A33] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#848D9A] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Standard single-column formats</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Evidence-based optimization</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Free vector PDF export</span>
                </div>
              </div>

            </div>

            {/* Right Column: Sophisticated Product Demonstration */}
            <div className="lg:col-span-7 w-full">
              <InteractiveHeroStudio />
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          2. ATS COMPATIBILITY & PARSER ARCHITECTURE
      ===================================================== */}
      <AtsCompatibilitySection />

      {/* =====================================================
          3. PRODUCT STORYTELLING (01 BUILD → 02 ANALYZE → 03 OPTIMIZE → 04 TAILOR)
      ===================================================== */}
      <ProductWorkflowStorytelling />

      {/* =====================================================
          4. RESUME TEMPLATE GALLERY (Editorial Design Library)
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-[#E6E8ED] dark:border-[#252A33] bg-white dark:bg-[#0C0D13]">
        <div className="max-w-6xl mx-auto">
          <InteractiveTemplateShowcase />
        </div>
      </section>

      {/* =====================================================
          5. SAMPLE LIBRARY (Show the Range of Use Cases)
      ===================================================== */}
      <SampleLibraryShowcase />

      {/* =====================================================
          6. PRODUCT WORKSPACE (Application Pipeline)
      ===================================================== */}
      <ApplicationPipelineWorkspace />

      {/* =====================================================
          7. TRUST, CREDIBILITY AND TRANSPARENCY
      ===================================================== */}
      <CredibilityAndTrustSection />

      {/* =====================================================
          8. TRANSPARENT PRICING
      ===================================================== */}
      <PricingSection />

      {/* =====================================================
          9. FREQUENTLY ASKED QUESTIONS & FINAL CALL TO ACTION
      ===================================================== */}
      <FaqAndFinalCta />

    </div>
  );
}
