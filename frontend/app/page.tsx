import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { NeonReveal } from '@/components/reactbits/NeonReveal';
import { GradientText } from '@/components/reactbits/GradientText';
import { StarBorder } from '@/components/reactbits/StarBorder';
import { DappledLight } from '@/components/reactbits/DappledLight';
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
    <div className="flex flex-col items-center overflow-x-hidden bg-[#090A10] text-white selection:bg-[#5525F5]/30 selection:text-white min-h-screen relative w-full">
      
      {/* Ambient Grid Pattern Overlay (Tactile Aceternity/Linear touch) */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      {/* =====================================================
          1. HERO SECTION (Crowned with Neon Reveal!)
      ===================================================== */}
      <section className="relative w-full pt-6 pb-16 sm:pt-10 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] text-white overflow-hidden z-10">
        
        <DappledLight color="#8B5CF6" opacity={0.35} />

        <NeonReveal
          neonColor="#D946EF"
          glowIntensity={0.85}
          beamHeight={500}
          tubeWidth="82%"
        >
          <div className="max-w-7xl mx-auto relative z-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Confident Editorial Positioning & CTAs */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                {/* Restrained Uppercase Eyebrow Label */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] text-zinc-300 text-xs font-semibold tracking-widest uppercase font-mono shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D946EF] animate-pulse" />
                  <span>Intelligent Resume Architecture</span>
                </div>

                {/* Confident Hero Headline with GradientText */}
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] xl:text-[54px] font-bold tracking-tight text-white leading-[1.12]">
                  Your experience deserves a{' '}
                  <GradientText
                    colors={['#FFFFFF', '#D946EF', '#8B5CF6', '#38BDF8', '#FFFFFF']}
                    animationSpeed="8s"
                  >
                    better presentation.
                  </GradientText>
                </h1>

                {/* Readable Supporting Copy */}
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                  Build structured resumes, understand job requirements, and create focused applications with evidence-backed AI assistance.
                </p>

                {/* Action CTAs (StarBorder for Primary CTA) */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link href="/login" className="w-full sm:w-auto">
                    <StarBorder speed="3s" glowColor="#D946EF" className="w-full sm:w-auto">
                      <span className="flex items-center gap-2">
                        <span>Build My Resume</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </StarBorder>
                  </Link>
                  <Link href="/tools/resume-checker" className="w-full sm:w-auto">
                    <button 
                      type="button"
                      className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl text-sm font-semibold h-12 px-6 bg-white/[0.05] hover:bg-white/[0.1] text-white hover:text-fuchsia-300 transition-all shadow-sm cursor-pointer"
                    >
                      <span>Explore the Product</span>
                    </button>
                  </Link>
                </div>

                {/* Trust-Oriented Product Attributes */}
                <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 font-medium">
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
        </NeonReveal>
      </section>

      {/* =====================================================
          2. COMPANY LOGOS ENDLESS CAROUSEL (Seamless Flow)
      ===================================================== */}
      <section className="w-full bg-[#090A10] relative z-10 py-6">
        <CompanyLogoCloud />
      </section>

      {/* =====================================================
          3. ATS COMPATIBILITY ENDLESS CAROUSEL (Seamless Flow)
      ===================================================== */}
      <section className="w-full bg-[#090A10] relative z-10 py-6">
        <AtsCompatibilityCloud />
      </section>

      {/* =====================================================
          4. CANDIDATE OUTCOMES & VERIFICATION SHOWCASE
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
          6. RESUME TEMPLATE GALLERY (Depth Cards)
      ===================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090A10] relative z-10">
        <div className="max-w-6xl mx-auto">
          <InteractiveTemplateShowcase />
        </div>
      </section>

      {/* =====================================================
          7. SAMPLE LIBRARY (Spotlight Cards)
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
