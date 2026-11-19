import { PromptSanitizer } from '../../ai/utils/prompt-sanitizer.js';
import type { AgentTool } from './tool.interface.js';

/**
 * Forbidden identity, privilege-escalation, and prototype-pollution keys
 * that MUST NEVER appear at any depth in LLM-emitted or client-supplied tool arguments.
 */
export const FORBIDDEN_TOOL_ARG_KEYS = new Set([
  'userid',
  'user_id',
  'ownerid',
  'owner_id',
  'tenantid',
  'tenant_id',
  'accountid',
  'account_id',
  'isadmin',
  'is_admin',
  'admin',
  'adminoverride',
  '__proto__',
  'constructor',
  'prototype',
]);

/**
 * Tool argument fields that routinely carry untrusted external text (JDs, PDFs, raw snippets)
 * and therefore receive full PromptSanitizer.sanitizeExternalDocument neutralization.
 */
const EXTERNAL_TEXT_ARG_KEYS = new Set([
  'jobDescriptionText',
  'targetJobDescription',
  'rawText',
  'descriptionText',
  'originalText',
]);

export interface ToolArgAllowlistResult {
  valid: boolean;
  sanitizedArgs?: Record<string, unknown>;
  droppedKeys: string[];
  injectionSignals: string[];
  error?: string;
}

/**
 * Recursively detects forbidden identity or prototype-pollution keys at any nesting depth.
 */
export function findForbiddenKeyDeep(value: unknown, depth = 0): string | null {
  if (depth > 8 || value === null || value === undefined || typeof value !== 'object') {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findForbiddenKeyDeep(item, depth + 1);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (FORBIDDEN_TOOL_ARG_KEYS.has(key.toLowerCase())) {
      return key;
    }
    const nested = findForbiddenKeyDeep(record[key], depth + 1);
    if (nested) return nested;
  }

  return null;
}

function sanitizeValueRecursively(
  value: unknown,
  keyName: string,
  injectionSignals: string[],
  depth = 0,
): unknown {
  if (depth > 6 || value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    if (EXTERNAL_TEXT_ARG_KEYS.has(keyName)) {
      const res = PromptSanitizer.sanitizeExternalDocument(value, 15000);
      if (res.detectedSignals.length > 0) {
        for (const sig of res.detectedSignals) {
          if (!injectionSignals.includes(sig)) injectionSignals.push(sig);
        }
      }
      return res.sanitizedText;
    }
    const { cleaned } = PromptSanitizer.stripSteganographicUnicode(value);
    return cleaned.slice(0, 6000);
  }

  if (Array.isArray(value)) {
    return value
      .slice(0, 50)
      .map((item) => sanitizeValueRecursively(item, keyName, injectionSignals, depth + 1));
  }

  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FORBIDDEN_TOOL_ARG_KEYS.has(k.toLowerCase())) continue;
      out[k] = sanitizeValueRecursively(v, k, injectionSignals, depth + 1);
    }
    return out;
  }

  return value;
}

/**
 * Strict Output Tool-Arg Allowlisting:
 * 1. Rejects any forbidden identity/privilege/prototype key at any depth.
 * 2. When the tool declares `inputSchema.properties`, keeps ONLY explicitly allowlisted
 *    top-level keys and drops any unexpected/smuggled keys emitted by an injected LLM.
 * 3. Strips zero-width Unicode smuggling from all string values and runs full prompt-injection
 *    neutralization on external job-description/text fields.
 */
export function allowlistAndSanitizeToolArgs(
  tool: Pick<AgentTool, 'name' | 'inputSchema'>,
  rawArgs: unknown,
): ToolArgAllowlistResult {
  if (rawArgs === null || rawArgs === undefined) {
    return { valid: true, sanitizedArgs: {}, droppedKeys: [], injectionSignals: [] };
  }

  if (typeof rawArgs !== 'object' || Array.isArray(rawArgs)) {
    return {
      valid: false,
      droppedKeys: [],
      injectionSignals: [],
      error: `Security violation: arguments for tool '${tool.name}' must be a plain object.`,
    };
  }

  const forbiddenKey = findForbiddenKeyDeep(rawArgs);
  if (forbiddenKey) {
    return {
      valid: false,
      droppedKeys: [],
      injectionSignals: [],
      error: `Security violation: forbidden argument key '${forbiddenKey}' cannot be supplied to tool '${tool.name}'. Authentication context is strictly authoritative.`,
    };
  }

  const schemaProps = (tool.inputSchema as { properties?: Record<string, unknown> } | undefined)
    ?.properties;
  const hasExplicitAllowlist =
    Boolean(schemaProps) && typeof schemaProps === 'object' && Object.keys(schemaProps!).length > 0;
  const allowedKeys = hasExplicitAllowlist ? new Set(Object.keys(schemaProps!)) : null;

  const record = rawArgs as Record<string, unknown>;
  const sanitizedArgs: Record<string, unknown> = {};
  const droppedKeys: string[] = [];
  const injectionSignals: string[] = [];

  for (const key of Object.keys(record)) {
    if (allowedKeys && !allowedKeys.has(key)) {
      droppedKeys.push(key);
      continue;
    }
    sanitizedArgs[key] = sanitizeValueRecursively(record[key], key, injectionSignals);
  }

  return {
    valid: true,
    sanitizedArgs,
    droppedKeys,
    injectionSignals,
  };
}

