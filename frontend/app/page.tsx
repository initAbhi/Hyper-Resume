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
import { TextMorph, NeonReveal } from '@/components/reactbits';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center overflow-x-hidden bg-[#090A10] text-white selection:bg-[#5525F5]/30 selection:text-white min-h-screen relative w-full">
      
      {/* Ambient Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* =====================================================
          1. HERO SECTION (Deep Tech Obsidian Grand Editorial & Studio with React Bits Neon Reveal)
      ===================================================== */}
      <NeonReveal
        colors={['#553aff', '#544fea']}
        backgroundColor="#0a0a0a"
        direction="down"
        expandFrom="center"
        easing="out"
        trigger="mount"
        revealDuration={2500}
        revealDelay={300}
        thickness={2.5}
        glow={0.85}
        spill={0.85}
        reach={1.0}
        intensity={0.9}
        feather={0.2}
        inset={0}
        length={0.9}
        hum={0.5}
        flicker={0.5}
        mirrored={false}
        interactive={false}
        intro={false}
        paused={false}
        className="w-full pt-24 pb-20 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8 bg-[#0a0a0a] text-white z-10"
      >
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-widest uppercase font-mono shadow-inner mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#553aff] animate-pulse" />
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
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-sm h-11 px-7 shadow-xl shadow-indigo-500/10 gap-2 cursor-pointer transition-all"
              >
                <span>Build My Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/tools/resume-checker" className="w-full sm:w-auto">
              <button 
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-semibold h-11 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] transition-all shadow-sm backdrop-blur-md cursor-pointer"
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
      </NeonReveal>

      {/* =====================================================
          2. COMPANY LOGOS ENDLESS CAROUSEL
      ===================================================== */}
      <section className="w-full bg-[#090A10] relative z-10 py-4">
        <CompanyLogoCloud />
      </section>

      {/* =====================================================
          3. ATS COMPATIBILITY ENDLESS CAROUSEL
      ===================================================== */}
      <section className="w-full bg-[#090A10] relative z-10 py-4">
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
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#090A10] relative z-10">
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
