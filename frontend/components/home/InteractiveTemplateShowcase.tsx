'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface TemplateItem {
  name: string;
  img: string;
  desc: string;
  rating?: number;
}

type CategoryKey = 'Most Popular' | 'Simple' | 'Modern' | 'Creative' | 'Compact';

const CATEGORIES: { id: CategoryKey; label: string }[] = [
  { id: 'Most Popular', label: 'Most Popular' },
  { id: 'Simple', label: 'Simple' },
  { id: 'Modern', label: 'Modern' },
  { id: 'Creative', label: 'Creative' },
  { id: 'Compact', label: 'Compact' },
];

const TEMPLATES_BY_CATEGORY: Record<CategoryKey, TemplateItem[]> = {
  'Most Popular': [
    {
      name: 'Modern',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c224ed91a362b6b2a1ae_Modern.avif',
      desc: 'A sleek design optimized for the tech industry. This template features distinct sections for technical skills and languages, making it the top choice for developers, engineers, and IT professionals who need to showcase expertise at a glance.',
      rating: 5,
    },
    {
      name: 'Harvard',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c201876b772ccf521976_Harvard.avif',
      desc: 'The definitive Harvard resume format, trusted by top universities and Ivy League graduates. This clean, education-first layout is ideal for students and recent graduates targeting competitive roles in finance, consulting, and academia.',
      rating: 5,
    },
    {
      name: "Jake's Resume",
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c207ce2523cbb765e4f2_Jake.avif',
      desc: "Our adaptation of Jake's Resume from Overleaf, now available without LaTeX coding. This high-density, single-column layout is a standard for software engineers and developers who need to showcase skills and projects.",
      rating: 5,
    },
    {
      name: 'Highlight',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c20cd82f8eb0925b4fc7_Highlight.avif',
      desc: "A professional modern resume template that uses subtle color accents to guide the recruiter's eye. Perfect for creative professionals and tech startups looking to stand out while maintaining strict ATS compatibility and high content density.",
      rating: 5,
    },
  ],
  Simple: [
    {
      name: 'Standard',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2131d23a352ea63a098_Standard.avif',
      desc: 'Our most popular reverse-chronological resume template. Designed for maximum readability, this standard format is the safest choice for applicants in corporate, government, and traditional sectors where clarity is king.',
      rating: 5,
    },
    {
      name: 'Simple',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04d6546aa9344414c7d0bc_Simple.avif',
      desc: "A minimalist resume template that uses negative space to guide the recruiter's eye. This clean, distraction-free layout is excellent for experienced professionals who want their achievements to speak for themselves without visual clutter.",
      rating: 5,
    },
    {
      name: 'Basic',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c219a552dc670bd77e8f_Basic.avif',
      desc: 'A traditional resume format that recruiters instantly recognize and trust. This no-nonsense layout is fully ATS-optimized and perfect for conservative industries like law, finance, and administration.',
      rating: 5,
    },
    {
      name: 'Minimalist',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c21f5217f5426cd9ddaf_Minimalist.avif',
      desc: 'Maximizes page space for dense information. Ideal for seasoned professionals with a lot to say in a limited area.',
      rating: 5,
    },
    {
      name: 'Harvard',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c201876b772ccf521976_Harvard.avif',
      desc: 'The definitive Harvard resume format, trusted by top universities and Ivy League graduates. This clean, education-first layout is ideal for students and recent graduates targeting competitive roles in finance, consulting, and academia.',
      rating: 5,
    },
  ],
  Modern: [
    {
      name: 'Modern',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c224ed91a362b6b2a1ae_Modern.avif',
      desc: 'A sleek design optimized for the tech industry. This template features distinct sections for technical skills and languages, making it the top choice for developers, engineers, and IT professionals who need to showcase expertise at a glance.',
      rating: 5,
    },
    {
      name: 'Smart',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2292196df57f604fd50_Smart.avif',
      desc: 'A professional layout designed to highlight linear career progression. The Smart template uses clear headers and robust spacing, making it perfect for managers and mid-level professionals demonstrating consistent growth and leadership.',
      rating: 5,
    },
    {
      name: 'Neat',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c22d00c27dc827b837aa_Neat.avif',
      desc: 'A timeless, ATS-compliant resume format engineered for large organizations. This template guarantees parsing accuracy, making it the safest bet for applications to Fortune 500 companies and global enterprises.',
      rating: 5,
    },
    {
      name: 'Trendy',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2311aefd39aaee6f45d_Trendy.avif',
      desc: 'Engaging and personable, using softer colors and playful graphics. Suited for customer-facing roles or jobs in small, family-run businesses.',
      rating: 5,
    },
    {
      name: "Jake's Resume",
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c207ce2523cbb765e4f2_Jake.avif',
      desc: "Our adaptation of Jake's Resume from Overleaf, now available without LaTeX coding. This high-density, single-column layout is a standard for software engineers and developers who need to showcase skills and projects.",
      rating: 5,
    },
  ],
  Creative: [
    {
      name: 'Bold',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c235de21eafa26098605_Bold.avif',
      desc: 'A high-impact creative resume template that commands attention. Designed for marketers, designers, and innovators, this format balances strong visual headers with professional structure to ensure your application is memorable.',
      rating: 5,
    },
    {
      name: 'Accent',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c23a1d7b47b6c1828e3a_Accent.avif',
      desc: 'A contemporary layout that helps build your personal brand. This template uses subtle color accents to highlight key sections, making it perfect for junior professionals and startup candidates who want to showcase personality without sacrificing readability.',
      rating: 5,
    },
    {
      name: 'Bright',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c23ff9ee1251d5eab797_Bright.avif',
      desc: 'A design-forward template tailored for fashion, media, and the arts. This aesthetic layout highlights your individual creativity while remaining fully parsable by ATS software, giving you the best of both worlds.',
      rating: 5,
    },
    {
      name: 'Vibrant',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2435cd334a4f66c7e18_Vibrant.avif',
      desc: 'Bright and inviting design that breaks away from the traditional. Perfect for new graduates or those in casual fields.',
      rating: 5,
    },
    {
      name: 'Highlight',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c20cd82f8eb0925b4fc7_Highlight.avif',
      desc: "A professional modern resume template that uses subtle color accents to guide the recruiter's eye. Perfect for creative professionals and tech startups looking to stand out while maintaining strict ATS compatibility and high content density.",
      rating: 5,
    },
  ],
  Compact: [
    {
      name: 'Compact',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c249d6dfd6b5121900d9_Compact.avif',
      desc: 'A high-density layout designed to maximize page real estate. This one-page resume template allows seasoned professionals to list extensive experience without spilling onto a second page. Ideal for lawyers, consultants, and executives with long work histories.',
      rating: 5,
    },
    {
      name: 'Maximum',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c2a20fe0381da4ad115d_Dense.avif',
      desc: 'A sophisticated design that commands authority. This executive resume template uses elegant typography and optimal spacing to create a high-end look. Perfect for leadership roles, luxury industries, and senior management applications.',
      rating: 5,
    },
    {
      name: 'Structured',
      img: 'https://cdn.prod.website-files.com/69e64c7c6b31ed98618646c6/6a04c28c23c19c75ffef183d_Structured.avif',
      desc: 'A highly organized layout defined by sleek lines and clear compartmentalization. This template projects reliability and attention to detail, making it the go-to choice for operations managers, engineers, and administrative professionals.',
      rating: 5,
    },
  ],
};

// 9 Category cards with exact logo images from Rezi CDN
const RESUME_CATEGORY_CARDS = [
  {
    category: 'Programming',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939c0ad16ffefdeeaa5_deloitte.jpg',
        alt: 'Deloitte',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939831cc2de8967b3d8_facebook.jpg',
        alt: 'Facebook',
      },
    ],
  },
  {
    category: 'Marketing',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a0469395b3c9f04b6c84cf2_zoom.jpg',
        alt: 'Zoom',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a04693973f6f4a3223dbc0a_youtube.jpg',
        alt: 'YouTube',
      },
    ],
  },
  {
    category: 'Engineering',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939575012afae612694_cloudflare.jpg',
        alt: 'Cloudflare',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939b04399d11bca89e2_microsoft.jpg',
        alt: 'Microsoft',
      },
    ],
  },
  {
    category: 'Business',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a0469394b0c3c5aba96bd30_kick.jpg',
        alt: 'Kick',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a04693929abd8a6933e15c1_adidas.jpg',
        alt: 'Adidas',
      },
    ],
  },
  {
    category: 'Finance',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046b9c66db94f038f6acc0_morgan-stanley.jpg',
        alt: 'Morgan Stanley',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046b9c9406a35296730cf9_goldman-sachs.jpg',
        alt: 'Goldman Sachs',
      },
    ],
  },
  {
    category: 'Student',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939831cc2de8967b3e0_stanford.jpg',
        alt: 'Stanford',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a0469390140a3f4ccd7473b_harvard_university_icon.jpeg.jpg',
        alt: 'Harvard',
      },
    ],
  },
  {
    category: 'Design',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a04693929abd8a6933e15be_apple.jpg',
        alt: 'Apple',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a04693969b60b031d558c5f_pinterest.jpg',
        alt: 'Pinterest',
      },
    ],
  },
  {
    category: 'Legal',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939457238d62d2828e8_huawei.jpg',
        alt: 'Huawei',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a046939185c61b1c194227d_sentry.jpg',
        alt: 'Sentry',
      },
    ],
  },
  {
    category: 'Medical',
    count: '18 resumes',
    logos: [
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a0469399931d48ab071ebd1_stryker.jpg',
        alt: 'Stryker',
      },
      {
        src: 'https://cdn.prod.website-files.com/69df9fb48ec66b133dcc708f/6a0469399b6e6cfd56d964c2_pfizer.jpg',
        alt: 'Pfizer',
      },
    ],
  },
];

export function InteractiveTemplateShowcase() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('Most Popular');
  const [activeIndex, setActiveIndex] = useState(0);

  const currentTemplates = TEMPLATES_BY_CATEGORY[activeCategory] || TEMPLATES_BY_CATEGORY['Most Popular'];
  const activeTemplate = currentTemplates[activeIndex] || currentTemplates[0];

  const handleCategoryChange = (cat: CategoryKey) => {
    setActiveCategory(cat);
    setActiveIndex(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : currentTemplates.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < currentTemplates.length - 1 ? prev + 1 : 0));
  };

  // Safe check if index is out of bounds when category changes
  useEffect(() => {
    if (activeIndex >= currentTemplates.length) {
      setActiveIndex(0);
    }
  }, [activeCategory, currentTemplates.length, activeIndex]);

  return (
    <div className="w-full space-y-16">
      {/* =========================================================================
          SECTION 1: ATS-FRIENDLY RESUME FORMATS THAT LAND JOBS (Rezi-Identical)
      ========================================================================= */}
      <div className="space-y-8">
        {/* Header Block with Eyebrow */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60">
              Resume Formats &amp; Examples
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-tight">
                ATS-friendly resume formats that land jobs
              </h2>
            </div>
            <div className="max-w-md">
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Use a template that guides you. Our ATS-compliant designs are trusted by over 4.5 million job seekers.
              </p>
            </div>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Carousel Viewport */}
        <div className="relative overflow-hidden w-full pb-2">
          <div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${Math.min(activeIndex, Math.max(0, currentTemplates.length - 3)) * (100 / 3 + 1.2)}%)`,
            }}
          >
            {currentTemplates.map((tpl, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={`${tpl.name}-${idx}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative rounded-[24px] bg-[#F9FAFB] dark:bg-zinc-900/60 p-4 sm:p-6 lg:p-7 border border-zinc-200/80 dark:border-zinc-800 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer select-none shrink-0 w-[88vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] ${
                    isActive ? 'shadow-sm' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Paper Frame with Crisp .avif Asset */}
                  <div
                    className={`relative w-full rounded-[14px] bg-white overflow-hidden transition-all duration-300 ${
                      isActive
                        ? 'border-2 border-[#2563EB] ring-4 ring-blue-500/10 shadow-xl'
                        : 'border border-zinc-200 shadow-xs group-hover:border-zinc-300'
                    }`}
                  >
                    <img
                      src={tpl.img}
                      alt={`${tpl.name} resume template preview`}
                      loading="lazy"
                      className="w-full h-auto object-cover block select-none pointer-events-none rounded-[12px]"
                    />

                    {/* Customize & Download Action Buttons on Active / Hover */}
                    <div
                      className={`absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 z-10 transition-all duration-300 ${
                        isActive
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 group-hover:opacity-100 translate-y-1'
                      }`}
                    >
                      <Link
                        href={`/login?template=${encodeURIComponent(tpl.name.toLowerCase())}`}
                        className="px-5 py-2 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Customize
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/login?download=${encodeURIComponent(tpl.name.toLowerCase())}`;
                        }}
                        className="px-4 py-2 rounded-full bg-[#71717A] hover:bg-zinc-700 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 transform hover:scale-105 cursor-pointer backdrop-blur-sm"
                      >
                        {/* Download Document SVG matching Rezi */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 20 20"
                          fill="none"
                          className="w-4 h-4 text-white"
                        >
                          <path
                            opacity="0.5"
                            d="M4 4V16C4 17.1031 4.89688 18 6 18H14C15.1031 18 16 17.1031 16 16V7.32812C16 6.79688 15.7906 6.2875 15.4156 5.9125L12.0844 2.58437C11.7094 2.20937 11.2031 2 10.6719 2H6C4.89688 2 4 2.89688 4 4Z"
                            fill="currentColor"
                          />
                          <path
                            d="M10.5297 15.7812C10.2359 16.075 9.76094 16.075 9.47031 15.7812L7.47031 13.7812C7.17656 13.4875 7.17656 13.0125 7.47031 12.7219C7.76406 12.4313 8.23906 12.4281 8.52969 12.7219L9.24844 13.4406V10.75C9.24844 10.3344 9.58281 10 9.99844 10C10.4141 10 10.7484 10.3344 10.7484 10.75V13.4406L11.4672 12.7219C11.7609 12.4281 12.2359 12.4281 12.5266 12.7219C12.8172 13.0156 12.8203 13.4906 12.5266 13.7812L10.5266 15.7812H10.5297Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Bottom Info & Navigation Controls */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                {activeTemplate.name}
              </h3>
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 text-amber-400"
                  >
                    <path d="M10.6718 1.40937C10.5437 1.15937 10.2843 1 10.0031 1C9.72183 1 9.46246 1.15937 9.33433 1.40937L7.03433 5.91563L2.03746 6.70937C1.75933 6.75312 1.52808 6.95 1.44058 7.21875C1.35308 7.4875 1.42496 7.78125 1.62183 7.98125L5.19683 11.5594L4.40933 16.5562C4.36558 16.8344 4.48121 17.1156 4.70933 17.2812C4.93746 17.4469 5.23746 17.4719 5.49058 17.3438L10.0031 15.05L14.5125 17.3438C14.7625 17.4719 15.0656 17.4469 15.2937 17.2812C15.5218 17.1156 15.6375 16.8375 15.5937 16.5562L14.8031 11.5594L18.3781 7.98125C18.5781 7.78125 18.6468 7.4875 18.5593 7.21875C18.4718 6.95 18.2437 6.75312 17.9625 6.70937L12.9687 5.91563L10.6718 1.40937Z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {activeTemplate.desc}
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handlePrev}
              title="Previous template"
              className="w-10 h-10 rounded-full bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next template"
              className="w-10 h-10 rounded-full bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: FIND INSPIRATION WITH GREAT RESUME EXAMPLES (Rezi-Identical)
      ========================================================================= */}
      <div className="space-y-6 pt-10 border-t border-zinc-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-zinc-950 dark:text-white">Find inspiration </span>
            <span className="text-zinc-400 dark:text-zinc-500 font-normal italic">
              with great resume examples
            </span>
          </h2>
        </div>

        {/* 10 Category Cards Grid matching Rezi's exact assets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {RESUME_CATEGORY_CARDS.map((item, idx) => (
            <Link
              key={idx}
              href={`/login?category=${encodeURIComponent(item.category.toLowerCase())}`}
              className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between min-h-[115px]"
            >
              {/* Overlapping Company Logos from Rezi CDN */}
              <div className="flex items-center -space-x-1.5 mb-3">
                {item.logos.map((logo, lIdx) => (
                  <div
                    key={lIdx}
                    className="w-7 h-7 rounded-full overflow-hidden border border-white dark:border-zinc-800 shadow-xs bg-zinc-100"
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.category}
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">{item.count}</p>
              </div>
            </Link>
          ))}

          {/* 10th Card: View All */}
          <Link
            href="/login"
            className="group p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex flex-col justify-between min-h-[115px]"
          >
            <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
              <span className="text-xs sm:text-sm font-bold">View all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>

            <div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Over 150+ resume examples to use
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
