/**
 * Security utility for isolating and neutralizing prompt injection attempts
 * in untrusted candidate answers, resumes, and job descriptions without
 * destructively stripping valid code or technical symbols (<T>, &&, ||, =>).
 */
export class PromptSanitizer {
  private static readonly MAX_ANSWER_CHARS = 1500;
  private static readonly MAX_CONTEXT_CHARS = 4000;

  /**
   * Sanitizes and bounds candidate answers submitted during an interview.
   */
  public static sanitizeCandidateAnswer(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // 1. Enforce length boundary
    const trimmed = input.trim().slice(0, this.MAX_ANSWER_CHARS);

    // 2. Neutralize boundary escape sequences without stripping code
    return trimmed
      .replace(/<\/?(system|instruction|prompt|context|untrusted)[^>]*>/gi, '')
      .replace(/^(system|assistant|human|user):\s*/gim, '')
      .replace(/ignore\s+all\s+(previous|prior)\s+instructions/gi, '[neutralized_directive]');
  }

  /**
   * Encapsulates untrusted input inside guarded XML-style data delimiters.
   */
  public static wrapUntrusted(tag: string, content: string): string {
    const cleanTag = tag.replace(/[^a-z0-9_]/gi, '');
    const cleanContent = this.sanitizeCandidateAnswer(content);
    return `<${cleanTag}>\n${cleanContent}\n</${cleanTag}>`;
  }
}

