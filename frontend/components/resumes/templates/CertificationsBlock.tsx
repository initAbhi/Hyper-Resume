'use client';

import React from 'react';
import type { ResumeContent } from '@/lib/api-client';
import {
  EditableField,
  CanvasSectionAddButton,
  CanvasSectionMoveButtons,
  CanvasEntryDeleteButton,
  useCanvasEdit,
} from './types';

interface CertificationsBlockProps {
  content: ResumeContent;
  accentColor?: string;
  variant?: 'clean' | 'serif' | 'bar';
  spacingClassName?: string;
}

/**
 * Shared inline-editable Certifications renderer mounted across all 10 templates.
 * Emits `<section data-resume-section="certifications">` so section reordering,
 * hiding, and adding/deleting certifications work identically everywhere.
 */
export function CertificationsBlock({
  content,
  accentColor = '#18181b',
  variant = 'clean',
  spacingClassName = 'space-y-1.5',
}: CertificationsBlockProps) {
  const { isEditable, onAddCertification, onDeleteCertification } = useCanvasEdit();
  const certifications = Array.isArray(content.certifications) ? content.certifications : [];

  if (certifications.length === 0) return null;

  return (
    <section
      data-resume-section="certifications"
      className={`resume-section ${spacingClassName}`}
    >
      {variant === 'serif' ? (
        <div className="relative border-b border-zinc-900 pb-0.5 mb-2 flex items-center justify-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 font-serif">
            Certifications
          </h2>
          <div className="absolute right-0 flex items-center gap-1">
            <CanvasSectionMoveButtons sectionKey="certifications" label="Certifications" />
            <CanvasSectionAddButton label="Cert" onClick={onAddCertification} />
          </div>
        </div>
      ) : variant === 'bar' ? (
        <div
          className="flex items-center justify-between pl-2 border-l-3"
          style={{ borderColor: accentColor }}
        >
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
            Certifications
          </h2>
          <div className="flex items-center gap-1">
            <CanvasSectionMoveButtons sectionKey="certifications" label="Certifications" />
            <CanvasSectionAddButton label="Cert" onClick={onAddCertification} />
          </div>
        </div>
      ) : (
        <div
          className="flex items-center justify-between pb-1 border-b"
          style={{
            borderBottomColor: accentColor !== '#000000' ? accentColor : '#d4d4d8',
          }}
        >
          <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-zinc-900">
            Certifications
          </h2>
          <div className="flex items-center gap-1">
            <CanvasSectionMoveButtons sectionKey="certifications" label="Certifications" />
            <CanvasSectionAddButton label="Cert" onClick={onAddCertification} />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {certifications.map((cert, idx) => (
          <div
            key={idx}
            className="resume-entry group/entry relative flex flex-wrap justify-between items-baseline gap-2 text-[10.5px]"
          >
            <CanvasEntryDeleteButton
              label="Delete certification"
              onClick={onDeleteCertification ? () => onDeleteCertification(idx) : undefined}
              className="top-0 -right-1"
            />
            <div className="min-w-0">
              <EditableField
                as="span"
                fieldPath={`certifications[${idx}].name`}
                value={cert.name || ''}
                placeholder="Certification Name"
                className="font-bold text-zinc-950"
              />
              {(isEditable || cert.issuer?.trim()) && (
                <>
                  <span className="text-zinc-500"> — </span>
                  <EditableField
                    as="span"
                    fieldPath={`certifications[${idx}].issuer`}
                    value={cert.issuer || ''}
                    placeholder="Issuing Organization"
                    className="font-medium text-zinc-700"
                  />
                </>
              )}
            </div>
            {(isEditable || cert.issueDate?.trim()) && (
              <EditableField
                as="span"
                fieldPath={`certifications[${idx}].issueDate`}
                value={cert.issueDate || ''}
                placeholder="Year"
                className="text-[10px] text-zinc-500 shrink-0"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
