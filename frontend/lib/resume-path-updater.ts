import type { ResumeContent } from './api-client';

/**
 * Immutably updates a deeply nested field in ResumeContent by string path.
 * Supports dot notation, numeric array indices, and custom section string IDs, e.g.:
 * - 'contact.fullName'
 * - 'headline'
 * - 'experience[0].bullets[1]'
 * - 'experience[0].endDate' (auto-syncs `current` flag when "Present")
 * - 'education[1].school'
 * - 'certifications[0].name'
 * - 'customSections[custom-1763421829312].entries[0].heading'
 */
export function updateResumeContentByPath(
  content: ResumeContent,
  path: string,
  value: string
): ResumeContent {
  if (!content || !path) return content;

  // Tokenize path preserving hyphens/UUIDs inside brackets
  const tokens = path
    .replace(/\[([^\]]+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  if (tokens.length === 0) return content;

  // Deep clone to guarantee immutable state transition
  const newContent = JSON.parse(JSON.stringify(content)) as ResumeContent;

  // Resolve customSections[<string-id>] to its numeric array index
  if (tokens[0] === 'customSections' && tokens.length >= 2 && !/^\d+$/.test(tokens[1])) {
    const targetId = tokens[1];
    const resolvedIdx = (newContent.customSections || []).findIndex(
      (sec) => sec && sec.id === targetId
    );
    if (resolvedIdx === -1) {
      return content;
    }
    tokens[1] = String(resolvedIdx);
  }

  let current: Record<string, unknown> = newContent as unknown as Record<string, unknown>;

  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (current[token] === undefined || current[token] === null) {
      const nextToken = tokens[i + 1];
      const isNextNumeric = /^\d+$/.test(nextToken);
      current[token] = isNextNumeric ? [] : {};
    }
    current = current[token] as Record<string, unknown>;
  }

  const finalKey = tokens[tokens.length - 1];
  current[finalKey] = value;

  // Keep `experience[i].current` in sync when user edits `endDate` inline
  if (tokens[0] === 'experience' && finalKey === 'endDate') {
    const normalized = value.trim().toLowerCase();
    current['current'] = normalized === 'present' || normalized === 'current' || normalized === 'now';
  }

  return newContent;
}

/**
 * Inserts a new empty bullet directly below the specified bullet index (or appends if bulletIdx omitted).
 */
export function insertBulletBelow(
  content: ResumeContent,
  section: 'experience' | 'projects' | 'custom',
  expIdx?: number,
  bulletIdx?: number,
  projIdx?: number,
  customSectionId?: string,
  customEntryIdx?: number
): ResumeContent {
  const newContent = JSON.parse(JSON.stringify(content)) as ResumeContent;

  if (section === 'experience' && typeof expIdx === 'number') {
    const exp = newContent.experience?.[expIdx];
    if (exp) {
      if (!Array.isArray(exp.bullets)) exp.bullets = [];
      const insertAt = typeof bulletIdx === 'number' ? bulletIdx + 1 : exp.bullets.length;
      exp.bullets.splice(insertAt, 0, '');
    }
  } else if (section === 'projects' && typeof projIdx === 'number') {
    const proj = newContent.projects?.[projIdx];
    if (proj) {
      if (!Array.isArray(proj.highlights)) proj.highlights = [];
      const insertAt = typeof bulletIdx === 'number' ? bulletIdx + 1 : proj.highlights.length;
      proj.highlights.splice(insertAt, 0, '');
    }
  } else if (section === 'custom' && customSectionId && typeof customEntryIdx === 'number') {
    const sec = (newContent.customSections || []).find((s) => s.id === customSectionId);
    if (sec && sec.entries?.[customEntryIdx]) {
      const entry = sec.entries[customEntryIdx];
      if (!Array.isArray(entry.bullets)) entry.bullets = [];
      const insertAt = typeof bulletIdx === 'number' ? bulletIdx + 1 : entry.bullets.length;
      entry.bullets.splice(insertAt, 0, '');
    }
  }

  return newContent;
}

/**
 * Deletes a bullet at the specified index.
 */
export function removeBulletAt(
  content: ResumeContent,
  section: 'experience' | 'projects' | 'custom',
  expIdx?: number,
  bulletIdx?: number,
  projIdx?: number,
  customSectionId?: string,
  customEntryIdx?: number
): ResumeContent {
  const newContent = JSON.parse(JSON.stringify(content)) as ResumeContent;

  if (section === 'experience' && typeof expIdx === 'number' && typeof bulletIdx === 'number') {
    const exp = newContent.experience?.[expIdx];
    if (exp && Array.isArray(exp.bullets) && exp.bullets.length > 0) {
      exp.bullets.splice(bulletIdx, 1);
    }
  } else if (section === 'projects' && typeof projIdx === 'number' && typeof bulletIdx === 'number') {
    const proj = newContent.projects?.[projIdx];
    if (proj && Array.isArray(proj.highlights) && proj.highlights.length > 0) {
      proj.highlights.splice(bulletIdx, 1);
    }
  } else if (section === 'custom' && customSectionId && typeof customEntryIdx === 'number' && typeof bulletIdx === 'number') {
    const sec = (newContent.customSections || []).find((s) => s.id === customSectionId);
    if (sec && sec.entries?.[customEntryIdx]?.bullets?.length) {
      sec.entries[customEntryIdx].bullets.splice(bulletIdx, 1);
    }
  }

  return newContent;
}

/**
 * Moves a bullet up or down within its parent array.
 */
export function moveBulletAt(
  content: ResumeContent,
  section: 'experience' | 'projects' | 'custom',
  direction: 'up' | 'down',
  expIdx?: number,
  bulletIdx?: number,
  projIdx?: number,
  customSectionId?: string,
  customEntryIdx?: number
): ResumeContent {
  if (typeof bulletIdx !== 'number') return content;
  const newContent = JSON.parse(JSON.stringify(content)) as ResumeContent;

  let list: string[] | undefined;
  if (section === 'experience' && typeof expIdx === 'number') {
    list = newContent.experience?.[expIdx]?.bullets;
  } else if (section === 'projects' && typeof projIdx === 'number') {
    list = newContent.projects?.[projIdx]?.highlights;
  } else if (section === 'custom' && customSectionId && typeof customEntryIdx === 'number') {
    const sec = (newContent.customSections || []).find((s) => s.id === customSectionId);
    list = sec?.entries?.[customEntryIdx]?.bullets;
  }

  if (!Array.isArray(list)) return content;
  const targetIdx = direction === 'up' ? bulletIdx - 1 : bulletIdx + 1;
  if (targetIdx < 0 || targetIdx >= list.length) return content;

  const [item] = list.splice(bulletIdx, 1);
  list.splice(targetIdx, 0, item);
  return newContent;
}

/**
 * Adds a new entry inside a custom section.
 */
export function addCustomSectionEntry(
  content: ResumeContent,
  customSectionId: string
): ResumeContent {
  const newContent = JSON.parse(JSON.stringify(content)) as ResumeContent;
  const sec = (newContent.customSections || []).find((s) => s.id === customSectionId);
  if (!sec) return content;
  if (!Array.isArray(sec.entries)) sec.entries = [];
  sec.entries.push({
    id: `${customSectionId}-${Date.now()}`,
    heading: 'New Entry Title',
    subtitle: 'Organization / Details',
    dateRange: '2025',
    locationOrLink: '',
    bullets: ['Describe key contribution or measurable outcome.'],
  });
  return newContent;
}

/**
 * Deletes an entry inside a custom section.
 */
export function deleteCustomSectionEntry(
  content: ResumeContent,
  customSectionId: string,
  entryIdx: number
): ResumeContent {
  const newContent = JSON.parse(JSON.stringify(content)) as ResumeContent;
  const sec = (newContent.customSections || []).find((s) => s.id === customSectionId);
  if (!sec || !Array.isArray(sec.entries)) return content;
  sec.entries.splice(entryIdx, 1);
  return newContent;
}
