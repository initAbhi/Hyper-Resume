/**
 * Typed environment configuration and validation for the Next.js frontend.
 * Enforces that no server secrets are accidentally exposed to the client.
 */

export interface FrontendEnv {
  apiUrl: string;
  isDev: boolean;
  isProd: boolean;
}

export function getFrontendEnv(): FrontendEnv {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Security guard: verify no secrets leaked into NEXT_PUBLIC
  if (process.env.NEXT_PUBLIC_DATABASE_PASSWORD || process.env.NEXT_PUBLIC_JWT_SECRET) {
    throw new Error('SECURITY VIOLATION: Database or JWT credentials must NEVER be exposed with NEXT_PUBLIC_ prefix.');
  }

  return {
    apiUrl: apiUrl.replace(/\/+$/, ''), // strip trailing slashes
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  };
}

export const env = getFrontendEnv();
