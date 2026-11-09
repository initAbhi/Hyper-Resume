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
import { TextMorph } from '@/components/reactbits';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden bg-[#090A10] text-white selection:bg-[#5525F5]/30 selection:text-white min-h-screen relative w-full">
      
      {/* Ambient Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* =====================================================
          1. HERO SECTION (Deep Tech Obsidian Grand Editorial & Studio)
      ===================================================== */}
      <section className="relative w-full pt-16 pb-20 sm:pt-20 sm:pb-28 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#090A10] text-white overflow-hidden z-10">
        
        {/* Ambient Volumetric Violet Glow (Smooth, organic lighting without artificial lines) */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(85, 37, 245, 0.22) 0%, rgba(67, 24, 216, 0.08) 50%, transparent 80%)',
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-semibold tracking-widest uppercase font-mono shadow-inner mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5525F5] animate-pulse" />
            <span>Intelligent Resume Architecture</span>
          </div>

          {/* Centered Editorial Headline with TextMorph */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-4xl mx-auto">
            Your experience deserves a{' '}
            <span className="inline-block">
              better{' '}
              <TextMorph 
                words={['career story.', 'ATS score.', 'interview invite.', 'presentation.']} 
                className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#C4B5FD] to-[#818CF8]"
              />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Build structured resumes, understand job requirements, and create focused applications with evidence-backed AI assistance.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-lg bg-[#5525F5] hover:bg-[#4318D8] text-white font-semibold text-sm h-11 px-7 shadow-lg shadow-violet-500/25 gap-2 border border-violet-400/30">
                <span>Build My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg text-sm font-semibold h-11 px-6 border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] text-white hover:border-violet-400/60 transition-all shadow-sm backdrop-blur-md cursor-pointer"
              >
                <span>Explore the Product</span>
              </button>
            </Link>
          </div>

          {/* Trust Attributes */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard single-column formats</span>
            </div>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evidence-based optimization</span>
            </div>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Free vector PDF export</span>
            </div>
          </div>

          {/* The Wide Interactive Studio Cockpit */}
          <div className="w-full mt-12 sm:mt-16">
            <InteractiveHeroStudio />
          </div>

        </div>
      </section>

      {/* =====================================================
          2. COMPANY LOGOS ENDLESS CAROUSEL
      ===================================================== */}
      <section className="w-full border-b border-white/[0.08] bg-[#090A10] relative z-10">
        <CompanyLogoCloud />
      </section>

      {/* =====================================================
          3. ATS COMPATIBILITY ENDLESS CAROUSEL
      ===================================================== */}
      <section className="w-full border-b border-white/[0.08] bg-[#090A10] relative z-10">
        <AtsCompatibilityCloud />
      </section>

      {/* =====================================================
          4. ATS COMPATIBILITY & PARSER ARCHITECTURE
      ===================================================== */}
      <div className="w-full relative z-10">
        <AtsCompatibilitySection />
      </div>

      {/* =====================================================
          5. PRODUCT STORYTELLING (01 BUILD → 02 ANALYZE → 03 OPTIMIZE → 04 TAILOR)
      ===================================================== */}
      <div className="w-full relative z-10">
        <ProductWorkflowStorytelling />
      </div>

      {/* =====================================================
          6. RESUME TEMPLATE GALLERY (Editorial Design Library)
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#090A10] relative z-10">
        <div className="max-w-6xl mx-auto">
          <InteractiveTemplateShowcase />
        </div>
      </section>

      {/* =====================================================
          7. SAMPLE LIBRARY (Show the Range of Use Cases)
      ===================================================== */}
      <div className="w-full relative z-10">
        <SampleLibraryShowcase />
      </div>

      {/* =====================================================
          8. PRODUCT WORKSPACE (Application Pipeline)
      ===================================================== */}
      <div className="w-full relative z-10">
        <ApplicationPipelineWorkspace />
      </div>

      {/* =====================================================
          9. TRUST, CREDIBILITY AND TRANSPARENCY
      ===================================================== */}
      <div className="w-full relative z-10">
        <CredibilityAndTrustSection />
      </div>

      {/* =====================================================
          10. TRANSPARENT PRICING
      ===================================================== */}
      <div className="w-full relative z-10">
        <PricingSection />
      </div>

      {/* =====================================================
          11. FREQUENTLY ASKED QUESTIONS & FINAL CALL TO ACTION
      ===================================================== */}
      <div className="w-full relative z-10">
        <FaqAndFinalCta />
      </div>

    </div>
  );
}
