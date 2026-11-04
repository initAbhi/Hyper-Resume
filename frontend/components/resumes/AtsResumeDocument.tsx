'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Check,
  User,
  Share2,
} from 'lucide-react';

export interface AtsResumeData {
  fullName: string;
  headline?: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  summary?: string;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    bullets: string[];
  }>;
  consultancy?: Array<{
    role: string;
    company: string;
    dates: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    field?: string;
    graduationDate: string;
    location?: string;
    honors?: string;
    gpa?: string;
  }>;
  skills: Array<{
    category: string;
    skills: string;
  }>;
}

// 100% Authentic, full-page, high-density career profile matching Rezi's exact sample
export const sampleAtsResumeData: AtsResumeData = {
  fullName: 'Charles Bloomberg',
  headline: 'Startup Executive & Senior Product Technologist',
  email: 'charlesbloomberg@gmail.com',
  phone: '(621) 799-5548',
  location: 'Seoul, South Korea',
  linkedinUrl: 'in/cbloomberg',
  summary:
    'Passion for building inspiring companies through industry-leading tech, design, and execution. An experienced early-stage global executive with an economics degree from the University of Wisconsin - Madison. Looking to join as a global startup consultant.',
  experience: [
    {
      company: 'Rezi',
      title: 'CEO & Founder',
      location: 'Seoul, South Korea',
      startDate: 'August 2015',
      endDate: 'Present',
      current: true,
      bullets: [
        'Built Rezi - the most loved resume software in the world, trusted by over 2,227,254 users worldwide.',
        'Founded Rezi at the age of 22. At 23, successfully globalized into South Korea growing to be South Korea\'s leading English resume company, the most awarded global startup in South Korea, and securing over $650,000 in investment, grants, and awards.',
        'Collaborated with the development team to engineer scalable partnership strategies such as redemption-code-based access which resulted in over 50,000 new users in 1 month with zero marketing dollars spent.',
        'Accountable for developing new business models as a response towards market conditions and opportunities which resulted in the development of 3 new core departments including e-learning, global recruiting, and data-vending.',
        '13 full time employees; 2,227,254 users; $650,000 total raised investment; $40,000,000 valuation.',
      ],
    },
    {
      company: 'Kaplan',
      title: 'Web Developer',
      location: 'La Crosse, WI',
      startDate: 'May 2015',
      endDate: 'November 2015',
      bullets: [
        'Executed website redesign of kaplancleantech.com using Expression Engine as a CMS while working with marketing and sales teams. Optimized 3 landing page variants using HTML, A/B testing software and customer feedback to increase leads for sales teams.',
        'Managed SEO campaigns using Moz Analytics, monitored site performance, and prepared ranking reports that were shared with the management team.',
        'Executed Google Analytics tracking campaigns to maximize the effectiveness of 5 email re-marketing initiatives deployed using Salesforce software. Used Salesforce Object Query Language, C, and Python to search for data for specific information.',
      ],
    },
    {
      company: 'Kaplan',
      title: 'Marketing Analyst',
      location: 'La Crosse, WI',
      startDate: 'November 2014',
      endDate: 'May 2015',
      bullets: [
        'Relied and implement Tableau dashboards to track 6 marketing KPIs. Used data to create reports circulated amongst leadership. Collaborated with marketing specialists to improve marketing strategies to maximize ROI such as introducing Facebook retargeting.',
        'Used SurveyMonkey to collect over 100 customer feedbacks used to conduct analysis, identify market trends, and calculate NPS. Used customer feedback data and optimization software to present and suggest website improvements to management.',
        'Managed mobile 2 PPC strategy efforts, using Google AdWords Editor and Marin, by teaching marketing specialists best practices to prepare for the behavioral shift towards increased reliance on mobile.',
      ],
    },
    {
      company: 'Wisconsin Public Television',
      title: 'Web Development Intern',
      location: 'Madison, WI',
      startDate: 'June 2012',
      endDate: 'September 2012',
      bullets: [
        'Integrated Analytics and marketing pixels to track behavior when introducing promos which brought in over $235k in sales.',
        'Redesigned company intranet to integrate current company processes with new website.',
      ],
    },
  ],
  consultancy: [
    {
      role: 'Early-Stage Startup Architect',
      company: 'Independant Startup Consultant',
      dates: 'June 2020 – Present',
      bullets: [
        'Worked with 3 global founders to bring well-executed MVPs to market through no-code and "ship-first" methodologies.',
        'Flashfeed, a media creation platform; SharedHomes, a rental platform; LV Global, international business consultancy.',
      ],
    },
  ],
  education: [
    {
      school: 'University of Wisconsin - Madison',
      degree: 'Bachelor of Science in Economics',
      field: 'Mathematics Emphasis',
      graduationDate: '2014',
      honors: 'Powers-Knapp Scholar, 2014',
    },
  ],
  skills: [
    {
      category: 'Leadership',
      skills: 'Speaking, Fundraising, Product Development, Communication, Partnerships, International Marketing',
    },
    {
      category: 'Front End',
      skills: 'HTML, CSS, Bootstrap, Webflow | Design: Photoshop, Illustrator, Sketch',
    },
    {
      category: 'Fields of Interest',
      skills: 'Early-Stage Fundraising, Global Entrepreneurship, Web Design, Growth',
    },
  ],
};

export type TemplateKey =
  | 'modern'
  | 'executive-serif'
  | 'simple-ats'
  | 'compact'
  | 'creative';

interface AtsResumeDocumentProps {
  data?: AtsResumeData;
  templateKey?: TemplateKey;
  accentColor?: string;
  showDividers?: boolean;
  showProfilePic?: boolean;
  interactiveToolbar?: boolean;
  className?: string;
}

export const COLOR_SWATCHES = [
  { id: 'blue', hex: '#2563eb', label: 'Royal Blue' },
  { id: 'emerald', hex: '#0d9488', label: 'Teal' },
  { id: 'coral', hex: '#e11d48', label: 'Coral' },
  { id: 'purple', hex: '#7c3aed', label: 'Purple' },
  { id: 'charcoal', hex: '#18181b', label: 'Charcoal' },
];

export function AtsResumeDocument({
  data = sampleAtsResumeData,
  templateKey = 'modern',
  accentColor: initialAccentColor,
  showDividers: initialDividers = true,
  showProfilePic: initialProfilePic = false,
  interactiveToolbar = false,
  className = '',
}: AtsResumeDocumentProps) {
  // Interactive styling controls matching Screenshot 1
  const [accentColor, setAccentColor] = useState(
    initialAccentColor ||
      (templateKey === 'modern' ? '#2563eb' : templateKey === 'creative' ? '#7c3aed' : '#18181b'),
  );
  const [showDividers, setShowDividers] = useState(initialDividers);
  const [showProfilePic, setShowProfilePic] = useState(initialProfilePic);

  const isExecutive = templateKey === 'executive-serif';
  const isSimple = templateKey === 'simple-ats';
  const isCompact = templateKey === 'compact';
  const isModern = templateKey === 'modern' || templateKey === 'creative';

  return (
    <div className={`relative w-full ${className}`}>
      {/* Floating Style Customizer Pill (Matching Screenshot 1) */}
      {interactiveToolbar && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[95vw] overflow-x-auto bg-zinc-900/90 dark:bg-zinc-800/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-zinc-700/80 p-2 sm:px-4 sm:py-2.5 flex items-center gap-2.5 sm:gap-5 text-xs animate-in fade-in select-none no-scrollbar">
          {/* Color Swatches */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-semibold text-zinc-300 text-[11px] hidden sm:inline">Color</span>
            <div className="flex items-center gap-1.5">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => setAccentColor(swatch.hex)}
                  title={swatch.label}
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                    accentColor === swatch.hex ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-zinc-900' : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-zinc-700 hidden sm:block shrink-0" />

          {/* Profile Pic Toggle */}
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <span className="text-zinc-300 font-semibold text-[11px] hidden sm:inline">Profile Pic</span>
            <input
              type="checkbox"
              checked={showProfilePic}
              onChange={(e) => setShowProfilePic(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                showProfilePic ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showProfilePic ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </div>
          </label>

          <div className="h-4 w-px bg-zinc-700 hidden sm:block shrink-0" />

          {/* Dividers Toggle */}
          <label className="flex items-center gap-2 cursor-pointer shrink-0">
            <span className="text-zinc-300 font-semibold text-[11px]">Dividers</span>
            <input
              type="checkbox"
              checked={showDividers}
              onChange={(e) => setShowDividers(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                showDividers ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showDividers ? 'left-4.5' : 'left-0.5'
                }`}
              />
            </div>
          </label>
        </div>
      )}

      {/* =========================================================================
          THE FULL-PAGE ATS RESUME SHEET (8.5 x 11 Standard Aspect Ratio & Density)
      ========================================================================= */}
      <div
        className={`resume-paper bg-white text-zinc-950 shadow-xl rounded-lg w-full max-w-[850px] mx-auto p-4 sm:p-8 md:p-12 transition-all ${
          isExecutive ? 'font-serif' : 'font-sans'
        }`}
        style={{
          boxSizing: 'border-box',
          lineHeight: isCompact ? '1.35' : '1.45',
        }}
      >
        {/* ================= TEMPLATE 1 & 4: MODERN (Screenshot 1 & 4) ================= */}
        {isModern && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-2">
              <div className="space-y-1">
                <h1
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={{ color: accentColor }}
                >
                  {data.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600 font-normal">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    <span>{data.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-zinc-400" />
                    <span>{data.email}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-zinc-400" />
                    <span>{data.phone}</span>
                  </span>
                  {data.linkedinUrl && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                      </svg>
                      <span>{data.linkedinUrl}</span>
                    </span>
                  )}
                </div>
              </div>

              {showProfilePic && (
                <div className="w-16 h-16 rounded-full bg-zinc-200 border-2 border-zinc-300 flex items-center justify-center shrink-0 text-zinc-500 overflow-hidden">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>

            {showDividers && <hr className="border-t border-zinc-200" />}

            {/* Summary */}
            {data.summary && (
              <div className="space-y-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-[11.5px] text-zinc-700 leading-relaxed font-normal">
                  {data.summary}
                </p>
              </div>
            )}

            {showDividers && <hr className="border-t border-zinc-200" />}

            {/* Professional Experience */}
            <div className="space-y-3.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                PROFESSIONAL EXPERIENCE
              </h2>

              <div className="space-y-3.5">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between text-xs">
                      <div>
                        <span
                          className="font-bold text-[12px]"
                          style={{ color: accentColor }}
                        >
                          {exp.title}
                        </span>
                        <span className="text-zinc-500 font-normal"> | </span>
                        <span className="font-bold text-zinc-900 text-[12px]">
                          {exp.company}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-500 font-medium">
                      {exp.startDate}—{exp.current ? 'Present' : exp.endDate}, {exp.location}
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-700 leading-relaxed">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {showDividers && <hr className="border-t border-zinc-200" />}

            {/* Education */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                EDUCATION
              </h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <div>
                    <span
                      className="font-bold text-[12px]"
                      style={{ color: accentColor }}
                    >
                      {edu.degree}
                    </span>
                    <span className="text-zinc-500 font-normal"> | </span>
                    <span className="font-bold text-zinc-900 text-[12px]">
                      {edu.school}
                    </span>
                  </div>
                  {edu.honors && (
                    <div className="text-[11px] text-zinc-500 font-medium mt-0.5">
                      {edu.honors}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showDividers && <hr className="border-t border-zinc-200" />}

            {/* Skills */}
            <div className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                EXPERT-LEVEL SKILLS
              </h2>
              <div className="space-y-1 text-[11px] text-zinc-700 leading-relaxed">
                {data.skills.map((sk, idx) => (
                  <div key={idx}>
                    <strong className="text-zinc-900 font-bold">{sk.category}: </strong>
                    <span>{sk.skills}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 2: EXECUTIVE SERIF (Screenshot 2) ================= */}
        {isExecutive && (
          <div className="space-y-4">
            {/* Centered Header */}
            <div className="text-center pb-2">
              <h1 className="text-2xl sm:text-3xl font-normal text-zinc-950 font-serif tracking-normal">
                {data.fullName}
              </h1>
              <div className="text-[11px] text-zinc-600 mt-1 flex items-center justify-center flex-wrap gap-1">
                <span>{data.location}</span>
                <span>•</span>
                <span>{data.email}</span>
                <span>•</span>
                <span>{data.phone}</span>
                {data.linkedinUrl && (
                  <>
                    <span>•</span>
                    <span>{data.linkedinUrl}</span>
                  </>
                )}
              </div>
            </div>

            {/* Summary */}
            {data.summary && (
              <div className="text-center space-y-1.5 pt-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-serif">
                  PROFESSIONAL SUMMARY
                </h2>
                <p className="text-[11px] text-zinc-700 leading-relaxed text-left font-serif">
                  {data.summary}
                </p>
              </div>
            )}

            {showDividers && <hr className="border-t border-zinc-200" />}

            {/* Experience */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-serif text-center">
                PROFESSIONAL EXPERIENCE
              </h2>

              <div className="space-y-3.5">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="font-bold text-zinc-950 text-[12px]">
                        {exp.company}
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        {exp.location}
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="font-bold text-zinc-900 italic text-[11.5px]">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        {exp.startDate}—{exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-700 leading-relaxed font-serif">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultancy Section (Screenshot 2) */}
            {data.consultancy && data.consultancy.length > 0 && (
              <div className="space-y-2 pt-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-serif text-center">
                  CONSULTANCY
                </h2>
                {data.consultancy.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="font-bold text-zinc-950 text-[11.5px]">{c.role}</span>
                        <span className="text-zinc-500"> | </span>
                        <span className="font-normal text-zinc-700 italic">{c.company}</span>
                      </div>
                      <span className="text-[11px] text-zinc-600">{c.dates}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-700 leading-relaxed font-serif">
                      {c.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            <div className="space-y-1.5 pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-serif text-center">
                EDUCATION
              </h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-zinc-950">{edu.degree} with a {edu.field}</span>
                    <div className="text-[11px] text-zinc-600">{edu.school}</div>
                  </div>
                  <div className="text-right text-[11px] text-zinc-600">
                    <div>{edu.honors?.split(',')[0]}</div>
                    <div>{edu.graduationDate}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-1.5 pt-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-serif text-center">
                EXPERT-LEVEL SKILLS
              </h2>
              <div className="space-y-1 text-[11px] text-zinc-700 leading-relaxed font-serif">
                {data.skills.map((sk, idx) => (
                  <div key={idx}>
                    <strong className="text-zinc-950 font-bold">{sk.category}: </strong>
                    <span>{sk.skills}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 3: SIMPLE / CLEAN ATS (Screenshot 3) ================= */}
        {isSimple && (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center pb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950">
                {data.fullName}
              </h1>
              <div className="text-[11px] text-zinc-600 mt-1 flex items-center justify-center flex-wrap gap-1">
                <span>• {data.location}</span>
                <span>• {data.email}</span>
                <span>• {data.phone}</span>
                {data.linkedinUrl && <span>• {data.linkedinUrl}</span>}
              </div>
            </div>

            {/* Professional Summary */}
            {data.summary && (
              <div className="space-y-1">
                <div className="text-xs font-bold text-zinc-900 border-b border-zinc-900 pb-0.5">
                  Professional Summary
                </div>
                <p className="text-[11px] text-zinc-700 leading-relaxed pt-1">
                  {data.summary}
                </p>
              </div>
            )}

            {/* Professional Experience */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-900 border-b border-zinc-900 pb-0.5">
                Professional Experience
              </div>

              <div className="space-y-3.5">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="font-bold text-zinc-950 text-[12px] italic">
                        {exp.company}
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        {exp.location}
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <div className="font-normal text-zinc-700 italic text-[11.5px]">
                        {exp.title}
                      </div>
                      <div className="text-[11px] text-zinc-600">
                        {exp.startDate}—{exp.current ? 'Present' : exp.endDate}
                      </div>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-700 leading-relaxed">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Consultancy Section */}
            {data.consultancy && data.consultancy.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-900 border-b border-zinc-900 pb-0.5 uppercase">
                  CONSULTANCY
                </div>
                {data.consultancy.map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs">
                      <div>
                        <span className="font-bold text-zinc-950 text-[11.5px]">{c.role}</span>
                        <span className="text-zinc-500"> | </span>
                        <span className="italic text-zinc-700">{c.company}</span>
                      </div>
                      <span className="text-[11px] text-zinc-600">{c.dates}</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-zinc-700 leading-relaxed">
                      {c.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-zinc-900 border-b border-zinc-900 pb-0.5">
                Education
              </div>
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs pt-0.5">
                  <div>
                    <div className="font-bold text-zinc-950">{edu.degree} with a {edu.field}</div>
                    <div className="text-[11px] text-zinc-600">{edu.school}</div>
                  </div>
                  <div className="text-right text-[11px] text-zinc-600">
                    <div>{edu.honors?.split(',')[0]}</div>
                    <div>{edu.graduationDate}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-zinc-900 border-b border-zinc-900 pb-0.5">
                EXPERT-LEVEL SKILLS
              </div>
              <div className="space-y-1 text-[11px] text-zinc-700 leading-relaxed pt-0.5">
                {data.skills.map((sk, idx) => (
                  <div key={idx}>
                    <strong className="text-zinc-900 font-bold">{sk.category}: </strong>
                    <span>{sk.skills}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TEMPLATE 4: COMPACT (Ultra High Density) ================= */}
        {isCompact && (
          <div className="space-y-2.5">
            <div className="text-center pb-1 border-b border-zinc-900">
              <h1 className="text-xl font-black uppercase tracking-tight text-zinc-950">
                {data.fullName}
              </h1>
              <div className="text-[10px] text-zinc-600 flex items-center justify-center flex-wrap gap-1.5 mt-0.5">
                <span>{data.location}</span>
                <span>•</span>
                <span>{data.email}</span>
                <span>•</span>
                <span>{data.phone}</span>
                <span>•</span>
                <span>{data.linkedinUrl}</span>
              </div>
            </div>

            {data.summary && (
              <div className="space-y-0.5">
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
                  Summary
                </div>
                <p className="text-[10px] text-zinc-700 leading-snug">
                  {data.summary}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
                Experience
              </div>
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between items-baseline text-[10.5px]">
                    <span className="font-bold text-zinc-950">{exp.title} &mdash; {exp.company}</span>
                    <span className="text-[9.5px] text-zinc-500">{exp.startDate}–{exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <ul className="list-disc pl-3 text-[10px] text-zinc-700 space-y-0.5 leading-snug">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5">
                Education & Skills
              </div>
              <div className="text-[10px] text-zinc-800">
                <span className="font-bold">{data.education[0]?.degree}</span> &mdash; {data.education[0]?.school} ({data.education[0]?.graduationDate})
              </div>
              <div className="text-[9.5px] text-zinc-700">
                <strong>Skills: </strong>
                {data.skills.map((s) => s.skills).join(' • ')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
