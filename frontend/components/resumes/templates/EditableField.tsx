'use client';

import React, { useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useCanvasEdit, type BulletSelectionMeta } from './CanvasEditContext';
import { renderHighlightedText } from './types';

export function focusAndPlaceCaretAtEnd(el: HTMLElement) {
  el.focus();
  if (typeof window !== 'undefined' && typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}

export interface EditableFieldProps {
  value: string;
  fieldPath: string;
  placeholder?: string;
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
  style?: React.CSSProperties;
  id?: string;
  isBullet?: boolean;
  multiline?: boolean;
  darkSurface?: boolean;
  bulletMeta?: Omit<BulletSelectionMeta, 'domRect' | 'currentText' | 'fieldPath'>;
  highlightKeywords?: string[];
  showHighlights?: boolean;
}

export function EditableField({
  value,
  fieldPath,
  placeholder = '',
  className = '',
  as = 'span',
  style,
  id,
  isBullet = false,
  multiline,
  darkSurface = false,
  bulletMeta,
  highlightKeywords,
  showHighlights = false,
}: EditableFieldProps) {
  const {
    isEditable,
    onUpdateField,
    setActiveSelection,
    onAddBulletBelow,
    onDeleteBullet,
    pendingDiffs,
    focusedDiffPath,
  } = useCanvasEdit();
  const elementRef = useRef<HTMLElement | null>(null);
  // Keep initial text stable across re-renders so React never replaces the live
  // contentEditable text node and resets the user's caret while typing.
  const initialTextRef = useRef<string>(value || '');
  const isTypingRef = useRef(false);
  const lastEmittedValueRef = useRef<string | null>(value || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMultiline = multiline ?? (fieldPath === 'summary');
  const activeDiff = isEditable && pendingDiffs ? pendingDiffs[fieldPath] : undefined;
  const hasPendingDiff = Boolean(activeDiff && activeDiff.status === 'pending');
  const isFocusedDiff = hasPendingDiff && focusedDiffPath === fieldPath;

  // Cleanup pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Smooth-scroll focused pending diff into view when selected from Agent panel
  useEffect(() => {
    if (!isFocusedDiff || !elementRef.current) return;
    if (typeof elementRef.current.scrollIntoView === 'function') {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      elementRef.current.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }
  }, [isFocusedDiff]);

  // Keep DOM in sync with external prop changes (Undo/Redo, AI Enhance, template switch,
  // bullet deletion shifting indices) while never clobbering the cursor or trailing spaces during live typing.
  useEffect(() => {
    const safeVal = value || '';
    const el = elementRef.current;
    if (!el) return;
    const isActivelyFocused = typeof document !== 'undefined' && document.activeElement === el;
    if (
      isActivelyFocused &&
      isTypingRef.current &&
      (lastEmittedValueRef.current === safeVal ||
        el.innerText.replace(/\u00A0/g, ' ').trim() === safeVal.replace(/\u00A0/g, ' ').trim())
    ) {
      return;
    }
    if (el.innerText !== safeVal) {
      el.innerText = safeVal;
      lastEmittedValueRef.current = safeVal;
    }
  }, [value]);

  if (!isEditable) {
    const safeVal = (value || '').trim();
    if (!safeVal) return null;
    const Tag = as;
    return (
      <Tag id={id} className={className} style={style}>
        {renderHighlightedText(value, highlightKeywords, showHighlights)}
      </Tag>
    );
  }

  const getBulletDomId = (idx: number) => {
    if (!bulletMeta) return null;
    if (bulletMeta.section === 'experience') return `exp-${bulletMeta.expIdx ?? 0}-bullet-${idx}`;
    if (bulletMeta.section === 'projects') return `proj-${bulletMeta.projIdx ?? 0}-bullet-${idx}`;
    return `custom-${bulletMeta.customSectionId ?? ''}-${bulletMeta.customEntryIdx ?? 0}-bullet-${idx}`;
  };

  const scheduleEmit = (rawValue: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (rawValue !== (value || '') && rawValue !== lastEmittedValueRef.current) {
        lastEmittedValueRef.current = rawValue;
        onUpdateField(fieldPath, rawValue);
      }
    }, 250);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    isTypingRef.current = true;
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const domRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right,
      };

      if (isBullet && bulletMeta) {
        setActiveSelection({
          ...bulletMeta,
          fieldPath,
          currentText: e.currentTarget.innerText || '',
          domRect,
        });
      } else if (fieldPath === 'summary') {
        setActiveSelection({
          section: 'summary',
          fieldPath,
          currentText: e.currentTarget.innerText || '',
          domRect,
        });
      } else {
        setActiveSelection(null);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    isTypingRef.current = false;
    const nextText = e.currentTarget.innerText.replace(/\u200B/g, '').trim();
    if (nextText === '' && e.currentTarget.innerHTML) {
      e.currentTarget.innerHTML = '';
    }
    if (nextText !== (value || '') || nextText !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = nextText;
      onUpdateField(fieldPath, nextText);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    isTypingRef.current = true;
    const rawText = e.currentTarget.innerText;
    const cleaned = rawText === '\n' ? '' : rawText;
    if (cleaned === '' && e.currentTarget.innerHTML === '<br>') {
      e.currentTarget.innerHTML = '';
    }
    // Preserve trailing spaces while actively typing; trim only on blur / Enter.
    scheduleEmit(cleaned);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (isBullet && e.key === 'Enter') {
      e.preventDefault();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      const currentText = e.currentTarget.innerText.trim();
      lastEmittedValueRef.current = currentText;
      onUpdateField(fieldPath, currentText);
      if (bulletMeta && onAddBulletBelow && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        onAddBulletBelow({
          ...bulletMeta,
          fieldPath,
          currentText,
          domRect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
          },
        });

        const nextId = getBulletDomId((bulletMeta.bulletIdx ?? 0) + 1);
        if (nextId && typeof window !== 'undefined') {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const nextEl = document.getElementById(nextId);
              if (nextEl) {
                focusAndPlaceCaretAtEnd(nextEl);
              }
            }, 60);
          });
        }
      }
    } else if (isBullet && e.key === 'Backspace' && !e.currentTarget.innerText.trim()) {
      if (bulletMeta && onDeleteBullet && elementRef.current) {
        e.preventDefault();
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        const currIdx = bulletMeta.bulletIdx ?? 0;
        const prevId = currIdx > 0 ? getBulletDomId(currIdx - 1) : null;
        const fallbackId = currIdx === 0 ? getBulletDomId(0) : null;

        const rect = elementRef.current.getBoundingClientRect();
        onDeleteBullet({
          ...bulletMeta,
          fieldPath,
          currentText: '',
          domRect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            bottom: rect.bottom,
            right: rect.right,
          },
        });

        if (typeof window !== 'undefined') {
          requestAnimationFrame(() => {
            setTimeout(() => {
              const targetEl = prevId
                ? document.getElementById(prevId)
                : fallbackId
                ? document.getElementById(fallbackId)
                : null;
              if (targetEl) {
                focusAndPlaceCaretAtEnd(targetEl);
              } else {
                setActiveSelection(null);
              }
            }, 60);
          });
        }
      }
    } else if (!isBullet && e.key === 'Enter' && !isMultiline) {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.blur();
      setActiveSelection(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    let plainText = e.clipboardData.getData('text/plain') || '';
    plainText = plainText.replace(/[\u200B-\u200D\uFEFF]/g, '');
    if (isBullet) {
      plainText = plainText.replace(/^\s*[•●▪▸‣\-*]\s+/, '').replace(/\r?\n+/g, ' ');
    } else if (!isMultiline) {
      plainText = plainText.replace(/\r?\n+/g, ' ');
    }
    if (document.queryCommandSupported && document.queryCommandSupported('insertText')) {
      document.execCommand('insertText', false, plainText);
    } else {
      const selection = window.getSelection();
      if (selection && selection.rangeCount) {
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(plainText));
        selection.collapseToEnd();
      }
    }
    if (elementRef.current) {
      isTypingRef.current = true;
      scheduleEmit(elementRef.current.innerText);
    }
  };

  const pendingRemovalClasses = hasPendingDiff
    ? 'bg-rose-50/90 text-rose-900 line-through decoration-rose-500/80 px-0.5 print:bg-transparent print:text-inherit print:no-underline print:px-0'
    : '';
  const focusedDiffClasses = isFocusedDiff
    ? 'ring-2 ring-blue-500 ring-offset-1 print:ring-0'
    : '';

  const surfaceHoverClasses = darkSurface
    ? 'hover:bg-white/10 hover:outline-dashed hover:outline-1 hover:outline-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/70 focus:ring-inset focus:bg-white/10 selection:bg-blue-400/40 empty:before:text-white/50'
    : 'hover:bg-blue-50/60 hover:outline-dashed hover:outline-1 hover:outline-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:ring-inset focus:bg-blue-50/30 selection:bg-blue-200 empty:before:text-zinc-400/80';

  const editableClasses = `cursor-text rounded-[2px] transition-all empty:before:content-[attr(data-placeholder)] empty:before:italic empty:before:pointer-events-none ${surfaceHoverClasses} ${pendingRemovalClasses} ${focusedDiffClasses} ${className}`;

  const Tag = as;
  const editableNode = (
    <Tag
      ref={elementRef as unknown as React.Ref<never>}
      id={id}
      contentEditable
      suppressContentEditableWarning
      data-editable-field="true"
      data-field-path={fieldPath}
      data-has-pending-diff={hasPendingDiff ? 'true' : undefined}
      data-placeholder={placeholder}
      className={editableClasses}
      style={style}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
    >
      {initialTextRef.current}
    </Tag>
  );

  if (!hasPendingDiff || !activeDiff) {
    return editableNode;
  }

  return (
    <>
      {editableNode}
      <span
        data-export-exclude="true"
        data-diff-overlay="true"
        data-diff-field={fieldPath}
        data-diff-status={activeDiff.status}
        contentEditable={false}
        className={`print:hidden mt-1 block rounded border border-emerald-300/90 bg-emerald-50/95 px-2 py-1 text-[10px] leading-snug text-emerald-950 shadow-2xs select-text ${
          isFocusedDiff ? 'ring-2 ring-blue-500 ring-offset-1' : ''
        }`}
      >
        <span className="inline-flex items-center gap-1.5 mr-1.5 align-middle">
          <span className="inline-flex items-center rounded bg-emerald-700 px-1 py-0.2 text-[8.5px] font-bold uppercase tracking-wide text-white">
            Proposed
          </span>
          {activeDiff.requiresConfirmation && (
            <span className="inline-flex items-center rounded bg-amber-600 px-1 py-0.2 text-[8.5px] font-bold uppercase tracking-wide text-white">
              Verify Metric
            </span>
          )}
        </span>
        <span className="sr-only">Proposed change: </span>
        <ins className="no-underline font-medium text-emerald-950">{activeDiff.proposed}</ins>
      </span>
    </>
  );
}

export interface EditableBulletListProps {
  bullets: string[];
  section?: 'experience' | 'projects' | 'custom';
  expIdx?: number;
  projIdx?: number;
  customSectionId?: string;
  customEntryIdx?: number;
  highlightKeywords?: string[];
  showHighlights?: boolean;
  className?: string;
  liClassName?: string;
}

export function EditableBulletList({
  bullets,
  section = 'experience',
  expIdx,
  projIdx,
  customSectionId,
  customEntryIdx,
  highlightKeywords,
  showHighlights,
  className = 'list-disc pl-3.5 space-y-0.5 text-[10.5px] text-zinc-700 leading-relaxed pt-0.5',
  liClassName = '',
}: EditableBulletListProps) {
  const { isEditable, onAddBulletBelow } = useCanvasEdit();
  const safeBullets = Array.isArray(bullets) ? bullets : [];

  if (!isEditable && safeBullets.length === 0) return null;

  const getBulletId = (bIdx: number) =>
    section === 'experience'
      ? `exp-${expIdx ?? 0}-bullet-${bIdx}`
      : section === 'projects'
      ? `proj-${projIdx ?? 0}-bullet-${bIdx}`
      : `custom-${customSectionId ?? ''}-${customEntryIdx ?? 0}-bullet-${bIdx}`;

  const getFieldPath = (bIdx: number) =>
    section === 'experience'
      ? `experience[${expIdx ?? 0}].bullets[${bIdx}]`
      : section === 'projects'
      ? `projects[${projIdx ?? 0}].highlights[${bIdx}]`
      : `customSections[${customSectionId}].entries[${customEntryIdx ?? 0}].bullets[${bIdx}]`;

  const handleAddFirstOrNextBullet = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!onAddBulletBelow) return;
    const insertAfterIdx = safeBullets.length - 1;
    const targetIdx = safeBullets.length;
    onAddBulletBelow({
      section,
      expIdx,
      projIdx,
      customSectionId,
      customEntryIdx,
      bulletIdx: insertAfterIdx,
      fieldPath: getFieldPath(Math.max(0, insertAfterIdx)),
      currentText: '',
    });
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById(getBulletId(targetIdx));
          if (el) focusAndPlaceCaretAtEnd(el);
        }, 60);
      });
    }
  };

  return (
    <div className="group/bullets">
      {safeBullets.length > 0 && (
        <ul className={className}>
          {safeBullets.map((bullet, bIdx) => (
            <li key={bIdx} className={liClassName}>
              <EditableField
                id={getBulletId(bIdx)}
                fieldPath={getFieldPath(bIdx)}
                value={bullet}
                placeholder="Describe impact or metric..."
                isBullet={true}
                bulletMeta={{
                  section,
                  expIdx,
                  bulletIdx: bIdx,
                  projIdx,
                  customSectionId,
                  customEntryIdx,
                }}
                highlightKeywords={highlightKeywords}
                showHighlights={showHighlights}
              />
            </li>
          ))}
        </ul>
      )}
      {isEditable && onAddBulletBelow && (
        <button
          type="button"
          tabIndex={-1}
          data-export-exclude="true"
          data-add-bullet-btn="true"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAddFirstOrNextBullet}
          className={`print:hidden mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium text-blue-600 hover:bg-blue-50 border border-dashed border-blue-200/90 transition-opacity cursor-pointer select-none ${
            safeBullets.length === 0
              ? 'opacity-100'
              : 'opacity-0 group-hover/bullets:opacity-100 focus:opacity-100'
          }`}
          title="Add bullet point"
          aria-label="Add bullet point"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>Add bullet</span>
        </button>
      )}
    </div>
  );
}
