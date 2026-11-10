'use client';

import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Eye,
  EyeOff,
  Globe,
  HeartHandshake,
  Layers,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  CustomResumeSection,
  CustomSectionKind,
  ResumeContent,
  ResumeSectionKey,
} from '@/lib/api-client';
import {
  CUSTOM_SECTION_PREFIX,
  moveSectionKey,
  normalizeLayoutSettings,
} from '@/lib/resume-layout';
import type { SectionRewriterTarget } from './SectionRewriterDialog';

interface CustomSectionsPanelProps {
  content: ResumeContent;
  onUpdateContent: (updater: (prev: ResumeContent) => ResumeContent) => void;
  onOpenSectionRewriter: (target: SectionRewriterTarget) => void;
}

const SECTION_PRESETS: Array<{
  kind: CustomSectionKind;
  title: string;
  sampleHeading: string;
  sampleSubtitle: string;
  sampleDate: string;
  sampleLocationOrLink: string;
  sampleBullet: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    kind: 'publications',
    title: 'Selected Publications',
    sampleHeading: 'Low-Latency Distributed Consensus in Production',
    sampleSubtitle: 'Systems Engineering Journal',
    sampleDate: '2025',
    sampleLocationOrLink: 'doi.org/example',
    sampleBullet:
      'Authored peer-reviewed architecture paper detailing multi-region storage failover.',
    icon: BookOpen,
  },
  {
    kind: 'awards',
    title: 'Awards & Honors',
    sampleHeading: 'Engineering Excellence Award',
    sampleSubtitle: 'Annual Leadership Recognition',
    sampleDate: '2025',
    sampleLocationOrLink: 'San Francisco, CA',
    sampleBullet:
      'Recognized for spearheading zero-downtime ledger migration across core services.',
    icon: Award,
  },
  {
    kind: 'volunteer',
    title: 'Volunteer Leadership',
    sampleHeading: 'Open Source Maintainer & Mentor',
    sampleSubtitle: 'Code for Civic Tech',
    sampleDate: '2023 – Present',
    sampleLocationOrLink: 'Remote',
    sampleBullet:
      'Mentored early-career contributors and triaged pull requests for accessibility tooling.',
    icon: HeartHandshake,
  },
  {
    kind: 'languages',
    title: 'Languages',
    sampleHeading: 'English (Native / Bilingual)',
    sampleSubtitle: 'Hindi (Full Professional), Spanish (Conversational)',
    sampleDate: '',
    sampleLocationOrLink: '',
    sampleBullet: '',
    icon: Globe,
  },
  {
    kind: 'custom',
    title: 'Speaking & Talks',
    sampleHeading: 'Scaling TypeScript Monorepos Cleanly',
    sampleSubtitle: 'TechConf Keynote Speaker',
    sampleDate: '2025',
    sampleLocationOrLink: 'Seattle, WA',
    sampleBullet:
      'Delivered technical talk covering CI build caching and modular API boundaries.',
    icon: Layers,
  },
];

let localIdCounter = 0;

function createCustomSectionId(prefix = 'sec'): string {
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto?.randomUUID === 'function'
  ) {
    return `${prefix}_${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  localIdCounter += 1;
  return `${prefix}_${localIdCounter}`;
}

export function CustomSectionsPanel({
  content,
  onUpdateContent,
  onOpenSectionRewriter,
}: CustomSectionsPanelProps) {
  const customSections = content.customSections || [];
  const normalizedLayout = normalizeLayoutSettings(
    content.layout,
    customSections,
  );
  const hiddenSet = new Set(normalizedLayout.hiddenSections);

  const handleAddPreset = (preset: (typeof SECTION_PRESETS)[number]) => {
    const id = createCustomSectionId();
    const layoutKey = `${CUSTOM_SECTION_PREFIX}${id}` as ResumeSectionKey;
    const newSection: CustomResumeSection = {
      id,
      title: preset.title,
      kind: preset.kind,
      entries: [
        {
          id: createCustomSectionId('entry'),
          heading: preset.sampleHeading,
          subtitle: preset.sampleSubtitle,
          dateRange: preset.sampleDate,
          locationOrLink: preset.sampleLocationOrLink,
          bullets: preset.sampleBullet ? [preset.sampleBullet] : [],
        },
      ],
    };

    onUpdateContent((prev) => {
      const nextSections = [...(prev.customSections || []), newSection];
      const nextLayout = normalizeLayoutSettings(prev.layout, nextSections);
      const nextOrder = nextLayout.sectionOrder.includes(layoutKey)
        ? nextLayout.sectionOrder
        : [...nextLayout.sectionOrder, layoutKey];

      return {
        ...prev,
        customSections: nextSections,
        layout: {
          ...(prev.layout || {}),
          sectionOrder: nextOrder,
        },
      };
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    const layoutKey = `${CUSTOM_SECTION_PREFIX}${sectionId}` as ResumeSectionKey;
    onUpdateContent((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter(
        (s) => s.id !== sectionId,
      ),
      layout: {
        ...(prev.layout || {}),
        sectionOrder: (prev.layout?.sectionOrder || []).filter(
          (k) => k !== layoutKey,
        ),
        hiddenSections: (prev.layout?.hiddenSections || []).filter(
          (k) => k !== layoutKey,
        ),
      },
    }));
  };

  const handleToggleVisibility = (sectionId: string) => {
    const layoutKey = `${CUSTOM_SECTION_PREFIX}${sectionId}` as ResumeSectionKey;
    onUpdateContent((prev) => {
      const prevHidden = new Set(prev.layout?.hiddenSections || []);
      if (prevHidden.has(layoutKey)) {
        prevHidden.delete(layoutKey);
      } else {
        prevHidden.add(layoutKey);
      }
      return {
        ...prev,
        layout: {
          ...(prev.layout || {}),
          hiddenSections: Array.from(prevHidden),
        },
      };
    });
  };

  const handleMoveSection = (
    sectionId: string,
    direction: 'up' | 'down',
  ) => {
    const layoutKey = `${CUSTOM_SECTION_PREFIX}${sectionId}` as ResumeSectionKey;
    onUpdateContent((prev) => {
      const nextOrder = moveSectionKey(
        normalizedLayout.sectionOrder,
        layoutKey,
        direction,
        prev.customSections,
      );
      return {
        ...prev,
        layout: {
          ...(prev.layout || {}),
          sectionOrder: nextOrder,
        },
      };
    });
  };

  const updateSectionField = (
    sectionId: string,
    updater: (sec: CustomResumeSection) => CustomResumeSection,
  ) => {
    onUpdateContent((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((s) =>
        s.id === sectionId ? updater(s) : s,
      ),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Custom Resume Sections ({customSections.length})
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Add Publications, Awards, Volunteer Work, or Speaking sections — rendered across all 10 templates, PDF, DOCX, and Rearrange.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {SECTION_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.kind}
                type="button"
                data-testid={`add-custom-preset-${preset.kind}`}
                onClick={() => handleAddPreset(preset)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <Icon className="w-3.5 h-3.5" />
                <span>+ {preset.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {customSections.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center space-y-2">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            No custom sections added yet
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Pick any preset above to insert an ATS-structured custom section onto your resume canvas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {customSections.map((sec) => {
            const layoutKey = `${CUSTOM_SECTION_PREFIX}${sec.id}` as ResumeSectionKey;
            const orderIdx = normalizedLayout.sectionOrder.indexOf(layoutKey);
            const isHidden = hiddenSet.has(layoutKey);

            return (
              <div
                key={sec.id}
                data-testid={`custom-section-card-${sec.id}`}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/30 space-y-3 text-xs"
              >
                {/* Section Header Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-700/70">
                  <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <input
                      type="text"
                      aria-label="Custom section title"
                      value={sec.title}
                      onChange={(e) =>
                        updateSectionField(sec.id, (cur) => ({
                          ...cur,
                          title: e.target.value,
                        }))
                      }
                      className="font-bold text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-1"
                    />
                    <select
                      aria-label="Custom section category"
                      value={sec.kind}
                      onChange={(e) =>
                        updateSectionField(sec.id, (cur) => ({
                          ...cur,
                          kind: e.target.value as CustomSectionKind,
                        }))
                      }
                      className="text-[11px] px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    >
                      <option value="publications">Publications</option>
                      <option value="awards">Awards</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="languages">Languages</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid={`rewrite-custom-section-${sec.id}`}
                      onClick={() =>
                        onOpenSectionRewriter({
                          sectionType: 'custom',
                          sectionLabel: sec.title || 'Custom Section',
                          customSectionId: sec.id,
                        })
                      }
                      className="h-7 px-2 text-[10.5px] gap-1 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>AI Rewrite</span>
                    </Button>
                    <button
                      type="button"
                      title="Move section up in layout"
                      disabled={orderIdx <= 0}
                      onClick={() => handleMoveSection(sec.id, 'up')}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Move section down in layout"
                      disabled={
                        orderIdx === -1 ||
                        orderIdx >= normalizedLayout.sectionOrder.length - 1
                      }
                      onClick={() => handleMoveSection(sec.id, 'down')}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title={isHidden ? 'Show on canvas' : 'Hide from canvas'}
                      onClick={() => handleToggleVisibility(sec.id)}
                      className={`p-1 rounded cursor-pointer ${
                        isHidden
                          ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {isHidden ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Delete custom section"
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1 rounded text-zinc-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Entries inside Section */}
                <div className="space-y-3">
                  {sec.entries.map((entry, entryIdx) => (
                    <div
                      key={entry.id || entryIdx}
                      className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          placeholder="Title / Award / Publication Name"
                          value={entry.heading}
                          onChange={(e) =>
                            updateSectionField(sec.id, (cur) => {
                              const nextEntries = [...cur.entries];
                              nextEntries[entryIdx] = {
                                ...nextEntries[entryIdx],
                                heading: e.target.value,
                              };
                              return { ...cur, entries: nextEntries };
                            })
                          }
                          className="font-semibold p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex-1"
                        />
                        {sec.entries.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateSectionField(sec.id, (cur) => ({
                                ...cur,
                                entries: cur.entries.filter(
                                  (_, idx) => idx !== entryIdx,
                                ),
                              }))
                            }
                            className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Subtitle / Venue / Issuer"
                          value={entry.subtitle || ''}
                          onChange={(e) =>
                            updateSectionField(sec.id, (cur) => {
                              const nextEntries = [...cur.entries];
                              nextEntries[entryIdx] = {
                                ...nextEntries[entryIdx],
                                subtitle: e.target.value,
                              };
                              return { ...cur, entries: nextEntries };
                            })
                          }
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Date (e.g. 2025)"
                          value={entry.dateRange || ''}
                          onChange={(e) =>
                            updateSectionField(sec.id, (cur) => {
                              const nextEntries = [...cur.entries];
                              nextEntries[entryIdx] = {
                                ...nextEntries[entryIdx],
                                dateRange: e.target.value,
                              };
                              return { ...cur, entries: nextEntries };
                            })
                          }
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Location or URL (optional)"
                          value={entry.locationOrLink || ''}
                          onChange={(e) =>
                            updateSectionField(sec.id, (cur) => {
                              const nextEntries = [...cur.entries];
                              nextEntries[entryIdx] = {
                                ...nextEntries[entryIdx],
                                locationOrLink: e.target.value,
                              };
                              return { ...cur, entries: nextEntries };
                            })
                          }
                          className="p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px]"
                        />
                      </div>

                      {/* Bullets */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10.5px] font-semibold text-zinc-500">
                            Details / Bullets
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateSectionField(sec.id, (cur) => {
                                const nextEntries = [...cur.entries];
                                nextEntries[entryIdx] = {
                                  ...nextEntries[entryIdx],
                                  bullets: [
                                    ...(nextEntries[entryIdx].bullets || []),
                                    'Add verified impact or contribution detail...',
                                  ],
                                };
                                return { ...cur, entries: nextEntries };
                              })
                            }
                            className="text-[10.5px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Bullet</span>
                          </button>
                        </div>

                        {(entry.bullets || []).map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-1.5">
                            <textarea
                              rows={2}
                              value={bullet}
                              onChange={(e) =>
                                updateSectionField(sec.id, (cur) => {
                                  const nextEntries = [...cur.entries];
                                  const nextBullets = [
                                    ...(nextEntries[entryIdx].bullets || []),
                                  ];
                                  nextBullets[bIdx] = e.target.value;
                                  nextEntries[entryIdx] = {
                                    ...nextEntries[entryIdx],
                                    bullets: nextBullets,
                                  };
                                  return { ...cur, entries: nextEntries };
                                })
                              }
                              className="flex-1 p-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateSectionField(sec.id, (cur) => {
                                  const nextEntries = [...cur.entries];
                                  nextEntries[entryIdx] = {
                                    ...nextEntries[entryIdx],
                                    bullets: (
                                      nextEntries[entryIdx].bullets || []
                                    ).filter((_, i) => i !== bIdx),
                                  };
                                  return { ...cur, entries: nextEntries };
                                })
                              }
                              className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateSectionField(sec.id, (cur) => ({
                        ...cur,
                        entries: [
                          ...cur.entries,
                          {
                            id: createCustomSectionId('entry'),
                            heading: 'New Entry',
                            subtitle: '',
                            dateRange: '2025',
                            bullets: ['Describe verified impact or detail...'],
                          },
                        ],
                      }))
                    }
                    className="w-full gap-1 text-[11px] h-8 border-dashed"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Entry to {sec.title || 'Section'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

