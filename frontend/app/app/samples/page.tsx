'use client';

import React from 'react';
import Link from 'next/link';
import { SampleLibraryView } from '@/components/samples/SampleLibraryView';
import { Plus, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function AppSampleLibraryPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E5E9] dark:border-[#252A33]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#285FEA]/10 text-[#285FEA] dark:bg-[#285FEA]/20 dark:text-[#5B8DFE]">
              <BookOpen className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold text-[#285FEA] uppercase tracking-wider">
              Benchmark ATS Resumes
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1D23] dark:text-[#F0F2F5]">
            Sample Resume Library
          </h1>
          <p className="text-xs sm:text-sm text-[#5A6270] dark:text-[#9EA7B4] mt-0.5 max-w-2xl">
            Browse and clone verified, high-scoring ATS resumes tailored for top engineering, product, and leadership roles at leading global companies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/app/resumes"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#285FEA] hover:bg-[#1E4FD0] text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Resume</span>
          </Link>
        </div>
      </div>

      {/* Main Filterable 4-Column Grid */}
      <SampleLibraryView />
    </div>
  );
}
