import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InteractiveHeroStudio } from '@/components/home/InteractiveHeroStudio';
import { CompanyLogoCloud } from '@/components/home/CompanyLogoCloud';
import { AtsCompatibilityCloud } from '@/components/home/AtsCompatibilityCloud';
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
          1. HERO SECTION (Dark Cinematic 3D Experience)
      ===================================================== */}
      <section className="relative w-full pt-12 pb-20 sm:pt-16 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#1E2235] bg-[#090A10] text-white overflow-hidden">
        
        {/* Soft Radial Backlight & Cinematic Vignette */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#5525F5]/18 via-[#4263FF]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -top-32 -left-20 w-[450px] h-[450px] bg-[#5525F5]/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Confident Editorial Positioning & CTAs */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              {/* Restrained Uppercase Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#161826] border border-[#262C42] text-zinc-300 text-xs font-semibold tracking-widest uppercase font-mono shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
                <span>Intelligent Resume Architecture</span>
              </div>

              {/* Confident Hero Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[54px] font-bold tracking-tight text-white leading-[1.12]">
                Your experience deserves a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#A5B4FC]">
                  better presentation.
                </span>
              </h1>

              {/* Readable Supporting Copy */}
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                Build structured resumes, understand job requirements, and create focused applications with evidence-backed AI assistance.
              </p>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white font-semibold text-sm h-11 px-7 shadow-lg shadow-violet-500/25 gap-2 border border-violet-400/30">
                    <span>Build My Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/tools/resume-checker" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-lg text-sm font-semibold h-11 px-6 border-[#363C58] bg-[#141726] text-white hover:border-[#4263FF] hover:bg-[#1C2034] transition-all">
                    <span>Explore the Product</span>
                  </Button>
                </Link>
              </div>

              {/* Trust-Oriented Product Attributes */}
              <div className="pt-4 border-t border-[#1C2032] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Standard single-column formats</span>
                </div>
                <span className="text-zinc-600">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evidence-based optimization</span>
                </div>
                <span className="text-zinc-600">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Free vector PDF export</span>
                </div>
              </div>

            </div>

            {/* Right Column: 3D Floating Resume System */}
            <div className="lg:col-span-7 w-full">
              <InteractiveHeroStudio />
            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          2. COMPANY LOGOS ENDLESS CAROUSEL
      ===================================================== */}
      <section className="w-full border-b border-[#E6E8ED] dark:border-[#252A33] bg-[#F7F8FA]/60 dark:bg-[#101216]/60">
        <CompanyLogoCloud />
      </section>

      {/* =====================================================
          3. ATS COMPATIBILITY ENDLESS CAROUSEL
      ===================================================== */}
      <section className="w-full border-b border-[#E6E8ED] dark:border-[#252A33] bg-white dark:bg-[#0C0D13]">
        <AtsCompatibilityCloud />
      </section>

      {/* =====================================================
          4. ATS COMPATIBILITY & PARSER ARCHITECTURE
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
