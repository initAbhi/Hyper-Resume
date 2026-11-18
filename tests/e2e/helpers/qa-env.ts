import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

export const API_BASE_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api/v1';
export const APP_BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
export const QA_SESSION_FILE = path.resolve(process.cwd(), 'tests/e2e/.qa-session.json');
export const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/qa/screenshots');

export interface QaSessionState {
  runId: string;
  userId: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
  secondaryUserId: string;
  secondaryEmail: string;
  secondaryAccessToken: string;
  personaResumeIds: Record<string, string>;
}

export function loadQaSession(): QaSessionState {
  if (!fs.existsSync(QA_SESSION_FILE)) {
    throw new Error(`QA session file not found at ${QA_SESSION_FILE}. Did globalSetup run?`);
  }
  return JSON.parse(fs.readFileSync(QA_SESSION_FILE, 'utf8')) as QaSessionState;
}

export function ensureScreenshotDir(): string {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  return SCREENSHOT_DIR;
}

export async function authenticatePage(page: Page, accessToken?: string): Promise<void> {
  const session = loadQaSession();
  const token = accessToken || session.accessToken;
  const refresh = session.refreshToken || '';
  await page.addInitScript(
    ({ tok, ref }: { tok: string; ref: string }) => {
      window.localStorage.setItem('hr_access_token', tok);
      if (ref) window.localStorage.setItem('hr_refresh_token', ref);
    },
    { tok: token, ref: refresh },
  );
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    body?: unknown;
  } = {},
): Promise<{ status: number; json: any; data: T }> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return {
    status: res.status,
    json,
    data: json && typeof json === 'object' && 'data' in json ? json.data : json,
  };
}

export interface BrowserDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  failedResponses: Array<{ url: string; status: number; method: string }>;
}

export function attachDiagnostics(page: Page): BrowserDiagnostics {
  const diag: BrowserDiagnostics = {
    consoleErrors: [],
    pageErrors: [],
    failedResponses: [],
  };
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      diag.consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    diag.pageErrors.push(err.message);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && !res.url().includes('accounts.google.com')) {
      diag.failedResponses.push({
        url: res.url(),
        status: res.status(),
        method: res.request().method(),
      });
    }
  });
  return diag;
}

export async function openResumeEditor(
  page: Page,
  resumeId: string,
  mode: 'canvas' | 'form' = 'canvas',
): Promise<void> {
  await page.addInitScript((m: string) => {
    window.localStorage.setItem('hyper_resume_editor_mode', m);
  }, mode);
  await page.goto(`${APP_BASE_URL}/app/resumes/${resumeId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#resume-document-print, [data-testid="canva-bottom-bar"]', {
    timeout: 20_000,
  });
}

export async function waitForSaved(page: Page, timeout = 10_000): Promise<void> {
  // Wait briefly for autosave debounce (650ms) + network roundtrip
  await page.waitForTimeout(900);
  const savingIndicator = page.getByText(/Saving/i).first();
  if (await savingIndicator.isVisible().catch(() => false)) {
    await savingIndicator.waitFor({ state: 'hidden', timeout }).catch(() => undefined);
  }
}

