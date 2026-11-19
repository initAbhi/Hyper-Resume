/**
 * Strict Gemini REST OpenAPI-subset responseSchema for ProposeEditsTool.
 * Enforces valid structured JSON directly inside Gemini's constrained decoder
 * so malformed JSON or markdown fence fallbacks cannot occur.
 */
export const ALLOWED_RESUME_TEMPLATE_KEYS = [
  'clean-modern',
  'jake-classic',
  'awesome-cv',
  'double-column',
  'executive',
  'minimalist',
  'sidebar',
  'crest',
  'deedy-academic',
  'creative-accent',
] as const;

export const HOLISTIC_PROPOSE_EDITS_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'OBJECT',
  properties: {
    changeSummary: {
      type: 'STRING',
      description: 'Concise summary of the resume improvements proposed.',
    },
    headline: {
      type: 'STRING',
      description: 'Optional improved resume headline.',
    },
    summary: {
      type: 'STRING',
      description: 'Optional improved professional summary (35-65 words).',
    },
    contact: {
      type: 'OBJECT',
      description: 'Optional contact field updates (only changed fields).',
      properties: {
        fullName: { type: 'STRING' },
        email: { type: 'STRING' },
        phone: { type: 'STRING' },
        location: { type: 'STRING' },
        linkedinUrl: { type: 'STRING' },
        githubUrl: { type: 'STRING' },
        websiteUrl: { type: 'STRING' },
      },
    },
    experience: {
      type: 'ARRAY',
      description: 'Targeted edits per experience role by zero-based experienceIndex.',
      items: {
        type: 'OBJECT',
        properties: {
          experienceIndex: { type: 'INTEGER' },
          bulletEdits: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                bulletIndex: { type: 'INTEGER' },
                proposed: { type: 'STRING' },
              },
              required: ['bulletIndex', 'proposed'],
            },
          },
          addedBullets: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['experienceIndex', 'bulletEdits'],
      },
    },
    projects: {
      type: 'ARRAY',
      description: 'Targeted edits per project by zero-based projectIndex.',
      items: {
        type: 'OBJECT',
        properties: {
          projectIndex: { type: 'INTEGER' },
          description: { type: 'STRING' },
          highlightEdits: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                highlightIndex: { type: 'INTEGER' },
                proposed: { type: 'STRING' },
              },
              required: ['highlightIndex', 'proposed'],
            },
          },
          addedHighlights: {
            type: 'ARRAY',
            items: { type: 'STRING' },
          },
        },
        required: ['projectIndex'],
      },
    },
    skills: {
      type: 'ARRAY',
      description: 'Optional complete updated skills list with categories.',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          category: { type: 'STRING' },
        },
        required: ['name'],
      },
    },
    certifications: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          issuer: { type: 'STRING' },
          issueDate: { type: 'STRING' },
        },
        required: ['name', 'issuer'],
      },
    },
    education: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          school: { type: 'STRING' },
          degree: { type: 'STRING' },
          field: { type: 'STRING' },
          graduationDate: { type: 'STRING' },
        },
        required: ['school', 'degree'],
      },
    },
    templateKey: {
      type: 'STRING',
      enum: [...ALLOWED_RESUME_TEMPLATE_KEYS],
    },
    layout: {
      type: 'OBJECT',
      properties: {
        pageMode: { type: 'STRING', enum: ['auto', 'single', 'multi'] },
        accentColor: { type: 'STRING' },
        fontFamily: { type: 'STRING', enum: ['sans', 'serif', 'mono'] },
        fontSizeScale: { type: 'NUMBER' },
        lineHeight: { type: 'NUMBER' },
        sectionSpacing: { type: 'NUMBER' },
        pageMargin: { type: 'NUMBER' },
      },
    },
  },
  required: ['changeSummary'],
};

export interface StrictJsonParseResult {
  parsed: Record<string, any> | null;
  strictDirectParse: boolean;
}

/**
 * Parses Gemini structured JSON output and records whether strict direct JSON.parse
 * succeeded without any markdown-fence or substring recovery fallback.
 */
export function parseStrictStructuredProposalJson(raw: string): StrictJsonParseResult {
  const trimmed = (raw || '').trim();
  if (!trimmed) {
    return { parsed: null, strictDirectParse: false };
  }

  // Primary strict path: responseSchema guarantees pure JSON directly parseable
  try {
    const direct = JSON.parse(trimmed);
    if (direct && typeof direct === 'object' && !Array.isArray(direct)) {
      return { parsed: direct as Record<string, any>, strictDirectParse: true };
    }
  } catch {
    // Fall through to defensive recovery only if an upstream proxy/model returned fences
  }

  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    const parsed = JSON.parse(unfenced);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return { parsed: parsed as Record<string, any>, strictDirectParse: false };
    }
  } catch {
    const start = unfenced.indexOf('{');
    const end = unfenced.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        const sliced = JSON.parse(unfenced.slice(start, end + 1));
        if (sliced && typeof sliced === 'object' && !Array.isArray(sliced)) {
          return { parsed: sliced as Record<string, any>, strictDirectParse: false };
        }
      } catch {
        return { parsed: null, strictDirectParse: false };
      }
    }
  }

  return { parsed: null, strictDirectParse: false };
}

