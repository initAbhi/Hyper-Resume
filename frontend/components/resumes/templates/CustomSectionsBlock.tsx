'use client';

import React from 'react';
import type { CustomResumeSection, ResumeContent } from '@/lib/api-client';
import {
  EditableField,
  EditableBulletList,
  CanvasSectionAddButton,
  CanvasSectionMoveButtons,
  CanvasEntryDeleteButton,
  useCanvasEdit,
} from './types';

interface CustomSectionsBlockProps {
  content: ResumeContent;
  accentColor?: string;
  highlightKeywords?: string[];
  showHighlights?: boolean;
  variant?: 'clean' | 'serif' | 'bar';
  spacingClassName?: string;
}

/**
 * Shared renderer for user-defined custom resume sections (Publications,
 * Awards & Honors, Volunteer Work, Languages, etc.) across all 10 templates.
 * Emits `<section data-resume-section="custom:<id>">` nodes inside the main
 * section container so `applyResumeLayoutToDom` can reorder and hide them identically
 * to built-in sections.
 */
export function CustomSectionsBlock({
  content,
  accentColor = '#18181b',
  highlightKeywords,
  showHighlights = false,
  variant = 'clean',
  spacingClassName = 'space-y-2',
}: CustomSectionsBlockProps) {
  const { isEditable, onAddCustomEntry, onDeleteCustomEntry } = useCanvasEdit();

  const customSections: CustomResumeSection[] = Array.isArray(content.customSections)
    ? content.customSections.filter((sec) => {
      if (!sec?.id) return false;
      if (isEditable) return true;
      return (
        Boolean(sec?.title?.trim()) &&
        Array.isArray(sec.entries) &&
        sec.entries.some(
          (e) =>
            Boolean(e.heading?.trim()) ||
            (e.bullets || []).some((b) => Boolean(b.trim()))
        )
      );
    })
    : [];

  if (customSections.length === 0) return null;

  return (
    <>
      {customSections.map((sec) => (
        <section
          key={sec.id}
          data-resume-section={`custom:${sec.id}`}
          className={`resume-section ${spacingClassName}`}
        >
          {variant === 'serif' ? (
            <div className="relative border-b border-zinc-900 pb-0.5 mb-2 flex items-center justify-center">
              <EditableField
                as="h2"
                fieldPath={`customSections[${sec.id}].title`}
                value={sec.title || ''}
                placeholder="Custom Section Title"
                className="text-xs font-bold uppercase tracking-widest text-zinc-900 font-serif"
              />
              <div className="absolute right-0 flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey={`custom:${sec.id}`} label={sec.title} />
                <CanvasSectionAddButton
                  label="Entry"
                  onClick={onAddCustomEntry ? () => onAddCustomEntry(sec.id) : undefined}
                />
              </div>
            </div>
          ) : variant === 'bar' ? (
            <div
              className="flex items-center justify-between pl-2 border-l-3"
              style={{ borderColor: accentColor }}
            >
              <EditableField
                as="h2"
                fieldPath={`customSections[${sec.id}].title`}
                value={sec.title || ''}
                placeholder="Custom Section Title"
                className="text-xs font-bold uppercase tracking-wider text-zinc-950"
              />
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey={`custom:${sec.id}`} label={sec.title} />
                <CanvasSectionAddButton
                  label="Entry"
                  onClick={onAddCustomEntry ? () => onAddCustomEntry(sec.id) : undefined}
                />
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-between pb-1 border-b"
              style={{
                borderBottomColor:
                  accentColor !== '#000000' ? accentColor : '#d4d4d8',
              }}
            >
              <EditableField
                as="h2"
                fieldPath={`customSections[${sec.id}].title`}
                value={sec.title || ''}
                placeholder="Custom Section Title"
                className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-900"
              />
              <div className="flex items-center gap-1">
                <CanvasSectionMoveButtons sectionKey={`custom:${sec.id}`} label={sec.title} />
                <CanvasSectionAddButton
                  label="Entry"
                  onClick={onAddCustomEntry ? () => onAddCustomEntry(sec.id) : undefined}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {(sec.entries || []).map((entry, idx) => {
              const subtitleVal =
                entry.subtitle ?? (entry as unknown as { subheading?: string }).subheading ?? '';
              return (
                <div
                  key={entry.id || idx}
                  className="resume-entry group/entry relative space-y-0.5 text-[10.5px]"
                >
                  <CanvasEntryDeleteButton
                    label="Delete custom entry"
                    onClick={
                      onDeleteCustomEntry
                        ? () => onDeleteCustomEntry(sec.id, idx)
                        : undefined
                    }
                    className="top-0 -right-1"
                  />
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <div className="font-bold text-zinc-950">
                      <EditableField
                        as="span"
                        fieldPath={`customSections[${sec.id}].entries[${idx}].heading`}
                        value={entry.heading || ''}
                        placeholder="Heading"
                      />
                      {(isEditable || subtitleVal.trim()) && (
                        <>
                          <span className="font-medium text-zinc-600"> — </span>
                          <EditableField
                            as="span"
                            fieldPath={`customSections[${sec.id}].entries[${idx}].subtitle`}
                            value={subtitleVal}
                            placeholder="Details / Organization"
                            className="font-medium text-zinc-600"
                          />
                        </>
                      )}
                    </div>
                    {(isEditable || entry.locationOrLink?.trim() || entry.dateRange?.trim()) && (
                      <span className="text-[10px] text-zinc-500 font-normal shrink-0 inline-flex items-center gap-1">
                        {(isEditable || entry.locationOrLink?.trim()) && (
                          <EditableField
                            as="span"
                            fieldPath={`customSections[${sec.id}].entries[${idx}].locationOrLink`}
                            value={entry.locationOrLink || ''}
                            placeholder="Location / Link"
                          />
                        )}
                        {(entry.locationOrLink?.trim() || isEditable) &&
                          (entry.dateRange?.trim() || isEditable) && (
                            <span>·</span>
                          )}
                        {(isEditable || entry.dateRange?.trim()) && (
                          <EditableField
                            as="span"
                            fieldPath={`customSections[${sec.id}].entries[${idx}].dateRange`}
                            value={entry.dateRange || ''}
                            placeholder="Date"
                          />
                        )}
                      </span>
                    )}
                  </div>

                  <EditableBulletList
                    bullets={entry.bullets || []}
                    section="custom"
                    customSectionId={sec.id}
                    customEntryIdx={idx}
                    highlightKeywords={highlightKeywords}
                    showHighlights={showHighlights}
                    className="list-disc pl-4 space-y-0.5 text-zinc-700 leading-relaxed"
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
