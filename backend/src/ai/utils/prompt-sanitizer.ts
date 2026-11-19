/**
 * Security utility for isolating and neutralizing indirect prompt injection attempts
 * in untrusted external job descriptions (Ashby/Greenhouse/Lever/HTML), uploaded PDFs,
 * candidate answers, and resume JSON without destructively stripping valid code or
 * technical symbols (<T>, &&, ||, =>, C++, System Design).
 */
export interface ExternalDocumentSanitizationResult {
  sanitizedText: string;
  detectedSignals: string[];
  strippedZeroWidthCount: number;
  wasSanitized: boolean;
}

const ZERO_WIDTH_AND_BIDI_REGEX =
  /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]|\uDB40[\uDC00-\uDC7F]/g;

const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const INJECTION_SIGNAL_RULES: ReadonlyArray<{ id: string; pattern: RegExp }> = [
  {
    id: 'ignore_previous_instructions',
    pattern:
      /\b(?:ignore|disregard|forget|override|bypass|discard)\s+(?:all\s+|any\s+|the\s+|your\s+)?(?:previous|prior|above|earlier|preceding|system|initial|original)\s+(?:instructions?|prompts?|rules?|directives?|guidelines?|constraints?|policies|context)\b/gi,
  },
  {
    id: 'new_system_prompt',
    pattern:
      /\b(?:new\s+system\s+(?:prompt|instruction|directive|message)|system\s+override|developer\s+mode\s+(?:enabled|activated|on)|begin\s+prompt\s+injection|end\s+of\s+system\s+prompt)\b/gi,
  },
  {
    id: 'role_hijack',
    pattern:
      /\b(?:you\s+are\s+now\s+(?:an?\s+)?(?:unrestricted|unfiltered|jailbroken|evil|admin|developer|system)\b|act\s+as\s+(?:an?\s+)?(?:unrestricted|jailbroken|system\s+admin|root\s+agent)\b|from\s+now\s+on\s+you\s+(?:must|will)\s+only\s+obey)/gi,
  },
  {
    id: 'chat_template_delimiter',
    pattern:
      /(?:<\|(?:im_start|im_end|endoftext|system|assistant|user|tool_call)\|>|<<\/?SYS>>|\[\/?INST\]|^#{2,6}\s*(?:SYSTEM|ADMIN|DEVELOPER\s+OVERRIDE|PROMPT\s+INJECTION)\b)/gim,
  },
  {
    id: 'xml_boundary_escape',
    pattern:
      /<\/?(?:system|instruction|instructions|prompt|context|untrusted|tool_call|function_call|developer|assistant_override)[^>]*>/gi,
  },
  {
    id: 'role_prefix_spoof',
    pattern: /^(?:system|assistant|human|user|developer)\s*:\s*/gim,
  },
  {
    id: 'tool_hijack_directive',
    pattern:
      /\b(?:call|invoke|execute|trigger|run)\s+(?:the\s+)?(?:tool|function)?\s*(?:apply_approved_edits|restore_resume_version|update_career_profile|delete_resume)\b|\b(?:apply_approved_edits|restore_resume_version|update_career_profile)\s*\(/gi,
  },
  {
    id: 'secret_exfiltration_directive',
    pattern:
      /\b(?:reveal|leak|dump|print|output|exfiltrate|send)\s+(?:all\s+|your\s+|the\s+)?(?:system\s+prompt|hidden\s+instructions?|api[_\s-]?keys?|env(?:ironment)?\s+variables?|secret\s+tokens?|database\s+credentials?)\b/gi,
  },
];

export class PromptSanitizer {
  private static readonly MAX_ANSWER_CHARS = 1500;
  private static readonly MAX_CONTEXT_CHARS = 4000;
  private static readonly MAX_EXTERNAL_DOC_CHARS = 15000;

  /**
   * Removes hidden HTML payloads commonly used to smuggle indirect prompt injections
   * inside external job boards (Ashby, Greenhouse, Lever, custom career sites):
   * HTML comments, hidden attributes, aria-hidden blocks, display:none, visibility:hidden,
   * opacity:0, font-size:0, and white-on-white / transparent text elements.
   */
  public static stripHiddenHtmlElements(html: string): {
    cleanedHtml: string;
    strippedCount: number;
  } {
    if (!html || typeof html !== 'string') {
      return { cleanedHtml: '', strippedCount: 0 };
    }

    let strippedCount = 0;
    let out = html;

    const removePattern = (pattern: RegExp) => {
      out = out.replace(pattern, () => {
        strippedCount += 1;
        return ' ';
      });
    };

    // 1. HTML comments (often hold <!-- SYSTEM: ignore previous instructions -->)
    removePattern(/<!--[\s\S]*?-->/g);

    // 2. Non-rendered tags
    removePattern(/<(script|style|noscript|template|iframe|object|embed)\b[\s\S]*?<\/\1>/gi);

    // 3. Elements explicitly hidden via HTML hidden / aria-hidden="true" or CSS stealth styles
    // Runs up to 2 passes to handle simple nested hidden spans/divs without backtracking bombs
    const hiddenBlockPatterns: RegExp[] = [
      /<([a-z][a-z0-9]*)\b[^>]*\b(?:hidden(?:\s*=\s*["']?(?:hidden|true|)["']?)?|aria-hidden\s*=\s*["']true["'])[^>]*>[\s\S]*?<\/\1>/gi,
      /<([a-z][a-z0-9]*)\b[^>]*\bstyle\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?(?:\s*;|\s*$)|font-size\s*:\s*0(?:px|em|rem|pt|%)?(?:\s*;|\s*$)|color\s*:\s*(?:transparent|#fff(?:fff)?|white|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0(?:\.0+)?\s*\)))[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi,
    ];

    for (let pass = 0; pass < 2; pass++) {
      const before = strippedCount;
      for (const pat of hiddenBlockPatterns) {
        removePattern(pat);
      }
      if (strippedCount === before) break;
    }

    return { cleanedHtml: out, strippedCount };
  }

  /**
   * Strips zero-width Unicode steganography, bidi override chars, Unicode tag chars
   * (U+E0000..U+E007F), and non-printable control characters.
   */
  public static stripSteganographicUnicode(text: string): {
    cleaned: string;
    strippedCount: number;
  } {
    if (!text || typeof text !== 'string') {
      return { cleaned: '', strippedCount: 0 };
    }
    let strippedCount = 0;
    const withoutZeroWidth = text.replace(ZERO_WIDTH_AND_BIDI_REGEX, () => {
      strippedCount += 1;
      return '';
    });
    const cleaned = withoutZeroWidth.replace(CONTROL_CHARS_REGEX, () => {
      strippedCount += 1;
      return '';
    });
    return { cleaned, strippedCount };
  }

  /**
   * Deeply sanitizes untrusted external documents (Ashby/Greenhouse/Lever JDs,
   * uploaded PDF/DOCX/TXT resumes and JDs) and returns audit telemetry on any
   * detected & neutralized prompt-injection payloads.
   */
  public static sanitizeExternalDocument(
    rawText: string,
    maxChars: number = this.MAX_EXTERNAL_DOC_CHARS,
  ): ExternalDocumentSanitizationResult {
    if (!rawText || typeof rawText !== 'string') {
      return {
        sanitizedText: '',
        detectedSignals: [],
        strippedZeroWidthCount: 0,
        wasSanitized: false,
      };
    }

    const { cleaned: unicodeClean, strippedCount: strippedZeroWidthCount } =
      this.stripSteganographicUnicode(rawText);

    let text = unicodeClean.trim().slice(0, maxChars);
    const detectedSignals: string[] = [];

    for (const rule of INJECTION_SIGNAL_RULES) {
      let matched = false;
      text = text.replace(rule.pattern, () => {
        matched = true;
        return rule.id === 'xml_boundary_escape' || rule.id === 'role_prefix_spoof'
          ? ''
          : '[neutralized_directive]';
      });
      if (matched) {
        detectedSignals.push(rule.id);
      }
    }

    return {
      sanitizedText: text.trim(),
      detectedSignals,
      strippedZeroWidthCount,
      wasSanitized: detectedSignals.length > 0 || strippedZeroWidthCount > 0,
    };
  }

  /**
   * Sanitizes and bounds candidate answers or untrusted text snippets submitted in prompts.
   */
  public static sanitizeCandidateAnswer(
    input: string,
    maxChars: number = this.MAX_ANSWER_CHARS,
  ): string {
    return this.sanitizeExternalDocument(input, maxChars).sanitizedText;
  }

  /**
   * Encapsulates untrusted input inside guarded XML-style data delimiters.
   */
  public static wrapUntrusted(
    tag: string,
    content: string,
    maxChars: number = this.MAX_CONTEXT_CHARS,
  ): string {
    const cleanTag = tag.replace(/[^a-z0-9_]/gi, '');
    const cleanContent = this.sanitizeCandidateAnswer(content, maxChars);
    return `<${cleanTag}>\n${cleanContent}\n</${cleanTag}>`;
  }
}
