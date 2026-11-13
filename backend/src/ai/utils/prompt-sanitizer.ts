/**
 * Security utility for isolating and neutralizing prompt injection attempts
 * in untrusted candidate answers, resumes, and job descriptions without
 * destructively stripping valid code or technical symbols (<T>, &&, ||, =>).
 */
export class PromptSanitizer {
  public static readonly MAX_ANSWER_CHARS = 1500;
  public static readonly MAX_JOB_DESCRIPTION_CHARS = 4000;
  public static readonly MAX_RESUME_CHARS = 6000;
  public static readonly MAX_CONTEXT_CHARS = 4000;

  /**
   * Sanitizes and bounds candidate answers submitted during an interview or prompt context.
   */
  public static sanitizeCandidateAnswer(
    input: string,
    maxChars: number = this.MAX_ANSWER_CHARS,
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // 1. Enforce length boundary
    const trimmed = input.trim().slice(0, maxChars);

    // 2. Neutralize boundary escape sequences without stripping code
    return trimmed
      .replace(/<\/?(system|instruction|prompt|context|untrusted)[^>]*>/gi, '')
      .replace(/^(system|assistant|human|user):\s*/gim, '')
      .replace(/ignore\s+all\s+(previous|prior)\s+instructions/gi, '[neutralized_directive]');
  }

  /**
   * Sanitizes and bounds job description text before LLM prompt interpolation.
   * Enforces 4,000 character maximum budget to prevent token overconsumption.
   */
  public static sanitizeJobDescription(
    input: string,
    maxChars: number = this.MAX_JOB_DESCRIPTION_CHARS,
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const trimmed = input.trim().slice(0, maxChars);

    return trimmed
      .replace(/<\/?(system|instruction|prompt|context|untrusted)[^>]*>/gi, '')
      .replace(/^(system|assistant|human|user):\s*/gim, '')
      .replace(/ignore\s+all\s+(previous|prior)\s+instructions/gi, '[neutralized_directive]');
  }

  /**
   * Sanitizes and bounds candidate resume plain-text before LLM analysis.
   * Enforces 6,000 character ceiling to protect context window limits.
   */
  public static sanitizeResumeText(
    input: string,
    maxChars: number = this.MAX_RESUME_CHARS,
  ): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    const trimmed = input.trim().slice(0, maxChars);

    return trimmed
      .replace(/<\/?(system|instruction|prompt|context|untrusted)[^>]*>/gi, '')
      .replace(/^(system|assistant|human|user):\s*/gim, '')
      .replace(/ignore\s+all\s+(previous|prior)\s+instructions/gi, '[neutralized_directive]');
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
