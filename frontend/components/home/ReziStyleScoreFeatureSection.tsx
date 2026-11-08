'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Target, 
  Layers, 
  FileCheck, 
  Eye, 
  ArrowRight,
  Sliders,
  Check,
  AlertTriangle
} from 'lucide-react';
import { ScoreMeter } from '@/components/resumes/ScoreMeter';

export function ReziStyleScoreFeatureSection() {
  const [activeSection, setActiveSection] = useState<'build' | 'score' | 'target'>('score');

  const sectionData = {
    build: {
      score: 94,
      candidate: 'Charles Bloomberg · Structural Audit',
      criteria: [
        { name: 'Single-Column Hierarchy', score: 100, color: 'text-emerald-400' },
        { name: 'Standard Section Headings', score: 100, color: 'text-emerald-400' },
        { name: 'Clean UTF-8 Parsing Flow', score: 98, color: 'text-emerald-400' },
        { name: 'A4 Layout & Density Fit', score: 92, color: 'text-blue-400' },
      ],
    },
    score: {
      score: 85,
      candidate: 'Charles Bloomberg · Live Audit',
      criteria: [
        { name: 'Content & Impact Verbs', score: 95, color: 'text-emerald-400' },
        { name: 'Formatting & ATS Structure', score: 100, color: 'text-emerald-400' },
        { name: 'Quantifiable Metrics (STAR)', score: 82, color: 'text-blue-400' },
        { name: 'Job Keyword Alignment', score: 88, color: 'text-emerald-400' },
      ],
    },
    target: {
      score: 89,
      candidate: 'Target: Lead Software Architect',
      criteria: [
        { name: 'Core Required Competencies', score: 94, color: 'text-emerald-400' },
        { name: 'Cloud Architecture Evidence', score: 96, color: 'text-emerald-400' },
        { name: 'Distributed Systems Keywords', score: 88, color: 'text-blue-400' },
        { name: 'Buzzword Penalty Check', score: 100, color: 'text-emerald-400', passText: 'Clean' },
      ],
    },
  };

  const currentData = sectionData[activeSection];

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-zinc-950 text-white p-4 sm:p-8 lg:p-16 border border-zinc-800 relative overflow-hidden shadow-2xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Interactive Nav Column */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Intelligent Diagnostic Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Create the resume to land your dream job.
          </h2>

          <div className="space-y-3 pt-2">
            {/* Build Feature */}
            <div 
              onClick={() => setActiveSection('build')}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                activeSection === 'build'
                  ? 'bg-zinc-900 border-zinc-700 shadow-lg'
                  : 'bg-zinc-900/40 border-transparent hover:bg-zinc-900/70 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${activeSection === 'build' ? 'text-white' : 'text-zinc-400'}`}>
                  1. Build & Structure
                </h3>
                {activeSection === 'build' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Deterministic single-column document hierarchies designed strictly for ATS parsers and human executive reviewers.
              </p>
            </div>

            {/* Score Feature */}
            <div 
              onClick={() => setActiveSection('score')}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                activeSection === 'score'
                  ? 'bg-zinc-900 border-blue-500/50 shadow-lg ring-1 ring-blue-500/20'
                  : 'bg-zinc-900/40 border-transparent hover:bg-zinc-900/70 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${activeSection === 'score' ? 'text-blue-400' : 'text-zinc-400'}`}>
                  2. Live Score Meter
                </h3>
                {activeSection === 'score' && <span className="w-2 h-2 rounded-full bg-blue-400" />}
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                Know exactly where you stand. The live ATS score breaks down section completeness, action verb density, and quantifiable results.
              </p>
            </div>

            {/* Target Feature */}
            <div 
              onClick={() => setActiveSection('target')}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                activeSection === 'target'
                  ? 'bg-zinc-900 border-zinc-700 shadow-lg'
                  : 'bg-zinc-900/40 border-transparent hover:bg-zinc-900/70 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${activeSection === 'target' ? 'text-white' : 'text-zinc-400'}`}>
                  3. Job Description Target
                </h3>
                {activeSection === 'target' && <span className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Inspect keyword requirements, eliminate buzzwords, and verify genuine evidence in your work experience before applying.
              </p>
            </div>
          </div>
        </div>

        {/* Right Realistic Dark Floating Card with Live Meter & Document */}
        <div className="lg:col-span-7 relative">
          <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                Live ATS Inspector Engine
              </span>
              <span className="font-mono text-[11px] bg-zinc-800 px-2 py-0.5 rounded text-emerald-400 font-bold">
                A4 Standard · 100% Parsable
              </span>
            </div>

            {/* Score Breakdown Display with Real Gauge */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mt-6 items-center">
              
              {/* Left inside: Meter */}
              <div className="sm:col-span-5 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 flex flex-col items-center text-center">
                <ScoreMeter score={currentData.score} variant="dark" textColor="text-white" />
                <span className="text-[11px] text-zinc-400 mt-2 font-medium">
                  {currentData.candidate}
                </span>
              </div>

              {/* Right inside: Multi-criteria Breakdown */}
              <div className="sm:col-span-7 space-y-2 text-xs">
                {currentData.criteria.map((crit) => (
                  <div key={crit.name} className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between transition-all duration-300">
                    <span className="text-zinc-300 font-medium">{crit.name}</span>
                    <span className={`font-bold ${crit.color}`}>
                      {(crit as any).passText || `${crit.score}% Pass`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Snippet Below */}
            <div className="mt-6 p-4 rounded-xl bg-white text-zinc-950 text-[11px] font-sans shadow-md">
              <div className="border-b border-zinc-300 pb-1 mb-2 font-serif flex justify-between items-baseline">
                <span className="font-bold uppercase tracking-wider text-xs">Charles Bloomberg</span>
                <span className="text-[10px] text-zinc-500">Seoul, KR • Lead Software Architect</span>
              </div>
              <p className="text-zinc-700 leading-tight">
                Architected and deployed cloud-native backend processing 18M+ transactions daily with 99.99% SLA uptime, reducing database latency by 44%.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
