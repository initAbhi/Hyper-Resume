'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Parse **bold**, `code`, and *italic* safely without dangerouslySetInnerHTML
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={idx} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={idx} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

export function formatMessageTimestamp(iso?: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export interface AgentMessageContentProps {
  content: string;
  isUser?: boolean;
  createdAt?: string;
}

export function AgentMessageContent({
  content,
  isUser = false,
  createdAt,
}: AgentMessageContentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Clipboard denied — fail silently
    }
  };

  const timeLabel = formatMessageTimestamp(createdAt);

  if (isUser) {
    return (
      <div className="space-y-1">
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {timeLabel && (
          <div className="text-[10px] text-white/75 text-right">{timeLabel}</div>
        )}
      </div>
    );
  }

  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushList = (keyBase: number) => {
    if (listItems.length === 0) return;
    const Tag = listOrdered ? 'ol' : 'ul';
    blocks.push(
      <Tag
        key={`list-${keyBase}`}
        className={`${listOrdered ? 'list-decimal' : 'list-disc'} pl-4 space-y-1 my-1`}
      >
        {listItems.map((item, i) => (
          <li key={i}>{renderInlineMarkdown(item)}</li>
        ))}
      </Tag>,
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(idx);
      return;
    }
    if (/^[-*•]\s+/.test(trimmed)) {
      if (listItems.length > 0 && listOrdered) flushList(idx);
      listOrdered = false;
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (listItems.length > 0 && !listOrdered) flushList(idx);
      listOrdered = true;
      listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
      return;
    }

    flushList(idx);

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4 key={idx} className="font-bold text-xs text-zinc-900 dark:text-zinc-50 mt-1">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h4>,
      );
    } else if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={idx} className="font-bold text-[13px] text-zinc-900 dark:text-zinc-50 mt-1">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h3>,
      );
    } else if (trimmed.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={idx}
          className="border-l-2 border-blue-500/70 pl-2.5 py-0.5 my-1 text-zinc-700 dark:text-zinc-300 bg-black/[0.03] dark:bg-white/[0.04] rounded-r"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>,
      );
    } else {
      blocks.push(
        <p key={idx} className="leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>,
      );
    }
  });
  flushList(lines.length);

  return (
    <div className="space-y-1.5 group/msg">
      <div className="space-y-1 break-words">{blocks}</div>
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {timeLabel ? (
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{timeLabel}</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => void handleCopy()}
          aria-label="Copy assistant response"
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-600" aria-hidden="true" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

