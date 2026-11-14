'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { LayoutGroup, motion } from 'motion/react';
import FadeContent from '@/components/FadeContent';
import LightRays from '@/components/LightRays';
import RotatingText from '@/components/RotatingText';
import { MovingBorderButton } from '@/components/ui/moving-border';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

const SCORE_ROWS = [
  { label: 'Formatting', score: '24/25' },
  { label: 'Measurable results', score: '23/25' },
  { label: 'Action verbs', score: '19/20' },
  { label: 'Technical depth', score: '14/15' },
  { label: 'Brevity', score: '14/15' },
] as const;

const ROLE_WORDS = ['engineers', 'designers', 'ML engineers', 'PMs'];

/**
 * Conversion hero — rotating role line + layered product visual.
 * Centered on mobile; split on large screens.
 */
export function LandingHero() {
  const [beams, setBeams] = useState(false);

  useEffect(() => {
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqWide = window.matchMedia('(min-width: 768px)');
    const sync = () => setBeams(!mqReduce.matches && mqWide.matches);
    sync();
    mqReduce.addEventListener('change', sync);
    mqWide.addEventListener('change', sync);
    return () => {
      mqReduce.removeEventListener('change', sync);
      mqWide.removeEventListener('change', sync);
    };
  }, []);

  return (
    <section className="relative w-full overflow-x-clip bg-[#0a0614] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pb-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% -8%, rgba(139,92,246,0.38), transparent 58%), radial-gradient(ellipse 45% 50% at 85% 15%, rgba(99,60,255,0.22), transparent 55%), radial-gradient(ellipse 40% 45% at 10% 40%, rgba(67,56,202,0.14), transparent 50%), linear-gradient(180deg, #12081f 0%, #0a0614 45%, #07040f 100%)',
        }}
        aria-hidden
      />

      {beams ? (
        <div className="pointer-events-none absolute inset-0 z-0 opacity-70" aria-hidden>
          <LightRays
            raysOrigin="top-center"
            raysColor="#a78bfa"
            raysSpeed={0.45}
            lightSpread={1.2}
            rayLength={1.7}
            rayDensity={0.95}
            glow={0.7}
            haze={0.4}
            atmosphere={0.28}
            intensity={0.85}
            fadeDistance={1}
            followMouse={false}
            cursorShadow={false}
            clickPulse={false}
            pulsating={false}
            noiseAmount={0.01}
            opacity={0.85}
            maxDevicePixelRatio={1.5}
            className="h-full w-full"
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-12 lg:gap-8 lg:px-14 xl:gap-10 xl:px-16">
        {/* Copy — centered on mobile, left on desktop */}
        <div className="mx-auto w-full max-w-xl text-center lg:col-span-5 lg:mx-0 lg:max-w-none lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-violet-300/90 sm:text-xs"
          >
            HypeResume
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-4 font-rubik text-[2.1rem] font-semibold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[2.85rem]"
          >
            <span className="block">The AI that gets</span>
            <LayoutGroup>
              <motion.span
                layout
                className="mt-1 inline-flex flex-wrap items-baseline justify-center gap-x-[0.35em] lg:justify-start"
              >
                <RotatingText
                  texts={ROLE_WORDS}
                  effect="slide"
                  direction="up"
                  highlight
                  highlightColor="#7c5cff"
                  rotationInterval={3200}
                  staggerFrom="last"
                  staggerDuration={0.025}
                  splitBy="characters"
                  animatePresenceMode="wait"
                  mainClassName="overflow-hidden py-[0.12em] text-[0.92em] font-semibold leading-none"
                  splitLevelClassName="overflow-hidden pb-[0.08em]"
                  transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                />
                <motion.span
                  layout
                  transition={{ type: 'spring', damping: 30, stiffness: 280 }}
                >
                  hired.
                </motion.span>
              </motion.span>
            </LayoutGroup>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-zinc-300 sm:text-base lg:mx-0"
          >
            Build ATS-safe resumes, match jobs with evidence, write cover letters, track every
            application, and practice interviews — without inventing metrics you can&apos;t defend.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start"
          >
            <MovingBorderButton
              as={Link}
              href="/register"
              duration={2500}
              containerClassName="h-12 w-full sm:w-auto sm:min-w-[200px]"
              className="gap-2 px-7 text-sm"
            >
              Build my resume
              <ArrowRight className="h-4 w-4" />
            </MovingBorderButton>

            <HoverBorderGradient
              as={Link}
              href="/tools/resume-checker"
              containerClassName="h-12 w-full sm:w-auto sm:min-w-[170px]"
              className="flex h-11 w-full items-center justify-center px-6 text-sm"
              duration={1.2}
            >
              Free ATS check
            </HoverBorderGradient>
          </motion.div>

          <FadeContent trigger="mount" delay={0.3} className="mt-8">
            <ul className="mx-auto flex max-w-md flex-col gap-2.5 text-left text-sm text-zinc-300 sm:mx-auto lg:mx-0">
              {[
                '5 welcome AI credits on signup',
                'Unlimited free PDF & DOCX — no watermarks',
                'Evidence-cited match — gaps stay visible',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/25 text-violet-200">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </FadeContent>
        </div>

        {/* Product visual */}
        <FadeContent
          trigger="mount"
          delay={0.2}
          duration={0.85}
          className="relative overflow-visible lg:col-span-7"
        >
          <div
            className="pointer-events-none absolute -inset-6 rounded-[40%] bg-violet-500/15 blur-3xl sm:-inset-10"
            aria-hidden
          />

          <div className="relative mx-auto max-w-xl overflow-visible px-2 sm:px-4 lg:max-w-none lg:px-6">
            <div className="relative mx-auto aspect-[3/3.7] max-w-[380px] overflow-hidden rounded-xl bg-white shadow-[0_40px_100px_rgba(0,0,0,0.55)] ring-1 ring-white/15 sm:max-w-[420px] lg:ml-auto lg:mr-10 lg:max-w-[440px]">
              <Image
                src="/marketing/hero/erik-resume.webp"
                alt="ATS-friendly software engineer resume preview"
                width={2000}
                height={2583}
                priority
                className="h-full w-full object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 460px"
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/80 to-transparent"
                aria-hidden
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="absolute -left-1 top-8 z-20 w-[min(92%,210px)] rounded-2xl bg-[#121214]/95 p-3 shadow-2xl ring-1 ring-white/12 backdrop-blur-md sm:left-0 sm:top-12 sm:w-[230px] sm:p-3.5 lg:-left-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                What we found
              </p>
              <ul className="mt-2.5 space-y-2 text-[11px] leading-snug text-zinc-300">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  Quantified AWS / Java impact
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                  Clean ATS section landmarks
                </li>
                <li className="flex gap-2 text-zinc-500">
                  <span className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center text-[10px]">
                    ○
                  </span>
                  Confirm 1 project metric
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="absolute -right-2 top-2 z-20 hidden w-[190px] rounded-2xl bg-[#121214]/95 p-3 shadow-2xl ring-1 ring-white/12 backdrop-blur-md sm:block sm:right-0 sm:top-4 sm:w-[210px] lg:-right-2"
            >
              <div className="flex items-end gap-2">
                <p className="font-rubik text-3xl font-semibold tabular-nums text-white">94</p>
                <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-violet-300">
                  / 100
                </p>
              </div>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
                Parser-ready
              </p>
              <ul className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-3">
                {SCORE_ROWS.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between text-[10px] text-zinc-400"
                  >
                    <span>{row.label}</span>
                    <span className="font-medium tabular-nums text-zinc-200">{row.score}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.5 }}
              className="absolute bottom-4 left-0 z-20 w-[min(94%,250px)] rounded-2xl bg-[#121214]/95 p-3 shadow-2xl ring-1 ring-white/12 backdrop-blur-md sm:bottom-8 sm:left-2 sm:w-[270px] sm:p-3.5 lg:left-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                Evidence-safe rewrite
              </p>
              <p className="mt-2 text-[10px] leading-snug text-zinc-500 line-through">
                Developed a Spring Boot app with Docker on AWS EC2.
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-zinc-200">
                Cut deployment overhead 40% by containerizing Spring Boot on AWS EC2 — shipping to
                30+ stakeholders in hours, not days.
              </p>
            </motion.div>
          </div>
        </FadeContent>
      </div>
    </section>
  );
}
