'use client';

import React, { createContext, useContext } from 'react';
import type { ResumeSectionKey } from '@/lib/api-client';
import type { AgentApprovalProposal } from '@/lib/agent-client';

export type CanvasFieldDiffStatus = 'pending' | 'approved' | 'rejected';

export interface CanvasFieldDiff {
  fieldPath: string;
  section: 'headline' | 'summary' | 'experience' | 'projects' | 'custom';
  original: string;
  proposed: string;
  status: CanvasFieldDiffStatus;
  proposalId?: string;
  label?: string;
  expIdx?: number;
  bulletIndex?: number;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
}

export interface CanvasDiffState {
  proposalId: string | null;
  diffsByPath: Record<string, CanvasFieldDiff>;
  focusedFieldPath: string | null;
}

export function buildCanvasDiffMapFromProposal(
  proposal: AgentApprovalProposal | null | undefined,
): Record<string, CanvasFieldDiff> {
  if (!proposal?.sectionDiffs) return {};

  const map: Record<string, CanvasFieldDiff> = {};
  const { headline, summary, experience } = proposal.sectionDiffs;

  if (
    headline &&
    typeof headline.proposed === 'string' &&
    headline.proposed.trim() !== (headline.original || '').trim()
  ) {
    map['headline'] = {
      fieldPath: 'headline',
      section: 'headline',
      original: headline.original || '',
      proposed: headline.proposed,
      status: 'pending',
      proposalId: proposal.executionId,
      label: 'Headline',
    };
  }

  if (
    summary &&
    typeof summary.proposed === 'string' &&
    summary.proposed.trim() !== (summary.original || '').trim()
  ) {
    map['summary'] = {
      fieldPath: 'summary',
      section: 'summary',
      original: summary.original || '',
      proposed: summary.proposed,
      status: 'pending',
      proposalId: proposal.executionId,
      label: 'Professional Summary',
    };
  }

  if (Array.isArray(experience)) {
    experience.forEach((exp, expIdx) => {
      if (!Array.isArray(exp?.bulletDiffs)) return;
      exp.bulletDiffs.forEach((bDiff) => {
        const orig = bDiff.original || '';
        const prop = bDiff.proposed || '';
        if (prop.trim() === orig.trim()) return;
        const path = `experience[${expIdx}].bullets[${bDiff.bulletIndex}]`;
        map[path] = {
          fieldPath: path,
          section: 'experience',
          original: orig,
          proposed: prop,
          status: 'pending',
          proposalId: proposal.executionId,
          label: `${exp.title || 'Role'} @ ${exp.company || 'Company'}`,
          expIdx,
          bulletIndex: bDiff.bulletIndex,
          requiresConfirmation: Boolean(bDiff.evidenceProvenance?.candidateConfirmationRequired),
          confirmationPrompt: bDiff.evidenceProvenance?.confirmationPrompt,
        };
      });
    });
  }

  return map;
}

export interface BulletSelectionMeta {
  section: 'experience' | 'projects' | 'custom' | 'summary';
  expIdx?: number;
  bulletIdx?: number;
  projIdx?: number;
  customSectionId?: string;
  customEntryIdx?: number;
  fieldPath: string;
  currentText: string;
  domRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
    bottom: number;
    right: number;
  };
}

export interface CanvasEditContextValue {
  isEditable: boolean;
  onUpdateField: (fieldPath: string, value: string) => void;
  activeSelection: BulletSelectionMeta | null;
  setActiveSelection: (selection: BulletSelectionMeta | null) => void;
  onAddBulletBelow?: (meta: BulletSelectionMeta) => void;
  onDeleteBullet?: (meta: BulletSelectionMeta) => void;
  onMoveBullet?: (meta: BulletSelectionMeta, direction: 'up' | 'down') => void;
  onAddExperience?: () => void;
  onAddProject?: () => void;
  onAddEducation?: () => void;
  onAddSkill?: (name?: string) => void;
  onAddCertification?: () => void;
  onDeleteExperience?: (index: number) => void;
  onDeleteProject?: (index: number) => void;
  onDeleteEducation?: (index: number) => void;
  onDeleteSkill?: (index: number) => void;
  onDeleteCertification?: (index: number) => void;
  onAddCustomEntry?: (customSectionId: string) => void;
  onDeleteCustomEntry?: (customSectionId: string, entryIdx: number) => void;
  onMoveSection?: (sectionKey: ResumeSectionKey, direction: 'up' | 'down') => void;
  pendingDiffs?: Record<string, CanvasFieldDiff>;
  focusedDiffPath?: string | null;
  onFocusDiff?: (fieldPath: string | null) => void;
}

const CanvasEditContext = createContext<CanvasEditContextValue>({
  isEditable: false,
  onUpdateField: () => {},
  activeSelection: null,
  setActiveSelection: () => {},
  pendingDiffs: undefined,
  focusedDiffPath: null,
  onFocusDiff: undefined,
});

export function useCanvasEdit() {
  return useContext(CanvasEditContext);
}

function inferSectionKeyFromLabel(label: string): ResumeSectionKey | null {
  const lower = label.trim().toLowerCase();
  if (lower.includes('role') || lower.includes('experience')) return 'experience';
  if (lower.includes('project')) return 'projects';
  if (lower.includes('degree') || lower.includes('education')) return 'education';
  if (lower.includes('skill')) return 'skills';
  if (lower.includes('cert')) return 'certifications';
  if (lower.includes('summary') || lower.includes('profile') || lower.includes('overview')) return 'summary';
  return null;
}

export interface CanvasSectionMoveButtonsProps {
  sectionKey: ResumeSectionKey;
  label?: string;
  darkSurface?: boolean;
  className?: string;
}

export function CanvasSectionMoveButtons({
  sectionKey,
  label = 'section',
  darkSurface = false,
  className = '',
}: CanvasSectionMoveButtonsProps) {
  const { isEditable, onMoveSection } = useCanvasEdit();
  if (!isEditable || !onMoveSection) return null;

  const btnTone = darkSurface
    ? 'text-white/80 hover:text-white hover:bg-white/15 border-white/30'
    : 'text-zinc-500 hover:text-blue-600 hover:bg-blue-50 border-zinc-200/90 bg-white/80';

  return (
    <span
      data-export-exclude="true"
      className={`print:hidden inline-flex items-center gap-0.5 select-none ${className}`}
    >
      <button
        type="button"
        tabIndex={-1}
        data-export-exclude="true"
        data-section-move-up={sectionKey}
        onClick={(e) => {
          e.stopPropagation();
          onMoveSection(sectionKey, 'up');
        }}
        className={`print:hidden inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold border transition-all opacity-75 hover:opacity-100 cursor-pointer ${btnTone}`}
        title={`Move ${label} up`}
        aria-label={`Move ${label} up`}
      >
        ▲
      </button>
      <button
        type="button"
        tabIndex={-1}
        data-export-exclude="true"
        data-section-move-down={sectionKey}
        onClick={(e) => {
          e.stopPropagation();
          onMoveSection(sectionKey, 'down');
        }}
        className={`print:hidden inline-flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold border transition-all opacity-75 hover:opacity-100 cursor-pointer ${btnTone}`}
        title={`Move ${label} down`}
        aria-label={`Move ${label} down`}
      >
        ▼
      </button>
    </span>
  );
}

export interface CanvasSectionAddButtonProps {
  label: string;
  onClick?: () => void;
  sectionKey?: ResumeSectionKey;
  darkSurface?: boolean;
  className?: string;
}

export function CanvasSectionAddButton({
  label,
  onClick,
  darkSurface = false,
  className = '',
}: CanvasSectionAddButtonProps) {
  const { isEditable } = useCanvasEdit();
  if (!isEditable || !onClick) return null;

  const addTone = darkSurface
    ? 'text-blue-200 hover:text-white hover:bg-white/15 border-white/30'
    : 'text-blue-700 hover:bg-blue-50 border-blue-200/90 bg-white';

  return (
    <button
      type="button"
      tabIndex={-1}
      data-export-exclude="true"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`print:hidden inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9.5px] font-semibold border transition-all cursor-pointer shadow-2xs select-none shrink-0 ${addTone} ${className}`}
      title={`Add new ${label}`}
      aria-label={`Add new ${label}`}
    >
      <span className="text-[11px] leading-none font-bold">+</span>
      <span>{label}</span>
    </button>
  );
}

export interface CanvasEntryDeleteButtonProps {
  onClick?: () => void;
  label?: string;
  variant?: 'entry' | 'chip';
  darkSurface?: boolean;
  className?: string;
}

export function CanvasEntryDeleteButton({
  onClick,
  label = 'Remove item',
  variant = 'entry',
  darkSurface = false,
  className = '',
}: CanvasEntryDeleteButtonProps) {
  const { isEditable } = useCanvasEdit();
  if (!isEditable || !onClick) return null;

  if (variant === 'chip') {
    const chipTone = darkSurface
      ? 'text-rose-300 hover:text-white hover:bg-rose-500'
      : 'text-rose-600 hover:text-white hover:bg-rose-600';
    return (
      <button
        type="button"
        data-export-exclude="true"
        data-entry-delete="skill"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`print:hidden inline-flex items-center justify-center w-4 h-4 rounded-full transition-all opacity-65 sm:opacity-0 group-hover/skill:opacity-100 group-focus-within/skill:opacity-100 focus-visible:opacity-100 cursor-pointer select-none text-[10px] leading-none font-bold ${chipTone} ${className}`}
        title={label}
        aria-label={label}
      >
        ×
      </button>
    );
  }

  const entryTone = darkSurface
    ? 'bg-zinc-900/90 text-rose-300 hover:text-white hover:bg-rose-600 border-white/25'
    : 'bg-white text-rose-600 hover:text-white hover:bg-rose-600 border-rose-200';

  return (
    <button
      type="button"
      data-export-exclude="true"
      data-entry-delete="entry"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`print:hidden absolute -top-1.5 -right-1.5 z-10 inline-flex items-center justify-center w-5 h-5 rounded-full border shadow-xs transition-all opacity-65 sm:opacity-0 group-hover/entry:opacity-100 group-focus-within/entry:opacity-100 focus-visible:opacity-100 cursor-pointer select-none text-[11px] leading-none font-bold ${entryTone} ${className}`}
      title={label}
      aria-label={label}
    >
      ×
    </button>
  );
}

export interface CanvasEditProviderProps {
  children?: React.ReactNode;
  isEditable: boolean;
  onUpdateField?: (fieldPath: string, value: string) => void;
  activeSelection?: BulletSelectionMeta | null;
  setActiveSelection?: (selection: BulletSelectionMeta | null) => void;
  onAddBulletBelow?: (meta: BulletSelectionMeta) => void;
  onDeleteBullet?: (meta: BulletSelectionMeta) => void;
  onMoveBullet?: (meta: BulletSelectionMeta, direction: 'up' | 'down') => void;
  onAddExperience?: () => void;
  onAddProject?: () => void;
  onAddEducation?: () => void;
  onAddSkill?: (name?: string) => void;
  onAddCertification?: () => void;
  onDeleteExperience?: (index: number) => void;
  onDeleteProject?: (index: number) => void;
  onDeleteEducation?: (index: number) => void;
  onDeleteSkill?: (index: number) => void;
  onDeleteCertification?: (index: number) => void;
  onAddCustomEntry?: (customSectionId: string) => void;
  onDeleteCustomEntry?: (customSectionId: string, entryIdx: number) => void;
  onMoveSection?: (sectionKey: ResumeSectionKey, direction: 'up' | 'down') => void;
  pendingDiffs?: Record<string, CanvasFieldDiff>;
  focusedDiffPath?: string | null;
  onFocusDiff?: (fieldPath: string | null) => void;
}

export function CanvasEditProvider({
  children,
  isEditable,
  onUpdateField = () => {},
  activeSelection = null,
  setActiveSelection = () => {},
  onAddBulletBelow,
  onDeleteBullet,
  onMoveBullet,
  onAddExperience,
  onAddProject,
  onAddEducation,
  onAddSkill,
  onAddCertification,
  onDeleteExperience,
  onDeleteProject,
  onDeleteEducation,
  onDeleteSkill,
  onDeleteCertification,
  onAddCustomEntry,
  onDeleteCustomEntry,
  onMoveSection,
  pendingDiffs,
  focusedDiffPath = null,
  onFocusDiff,
}: CanvasEditProviderProps) {
  return (
    <CanvasEditContext.Provider
      value={{
        isEditable,
        onUpdateField,
        activeSelection,
        setActiveSelection,
        onAddBulletBelow,
        onDeleteBullet,
        onMoveBullet,
        onAddExperience,
        onAddProject,
        onAddEducation,
        onAddSkill,
        onAddCertification,
        onDeleteExperience,
        onDeleteProject,
        onDeleteEducation,
        onDeleteSkill,
        onDeleteCertification,
        onAddCustomEntry,
        onDeleteCustomEntry,
        onMoveSection,
        pendingDiffs,
        focusedDiffPath,
        onFocusDiff,
      }}
    >
      {children}
    </CanvasEditContext.Provider>
  );
}
