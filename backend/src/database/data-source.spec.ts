import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AppDataSource Production Guard', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should throw an error in production if DATABASE_PASSWORD is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.DATABASE_PASSWORD;

    const importPath = './data-source.js';
    await expect(import(/* @vite-ignore */ importPath)).rejects.toThrow(
      'DATABASE_PASSWORD environment variable is required in production.',
    );
  });

  it('should load dataSourceOptions successfully in development with fallback password', async () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_PASSWORD;

    const importPath = './data-source.js';
    const mod = await import(/* @vite-ignore */ importPath);
    expect(mod.dataSourceOptions).toBeDefined();
    expect(mod.dataSourceOptions.database).toBe('hyper_resume_db');
    expect((mod.dataSourceOptions as any).password).toBe('12345');
  });

  it('should use explicit DATABASE_PASSWORD in production when provided', async () => {
    process.env.NODE_ENV = 'production';
    process.env.DATABASE_PASSWORD = 'super-secure-prod-password';

    const importPath = './data-source.js';
    const mod = await import(/* @vite-ignore */ importPath);
    expect(mod.dataSourceOptions).toBeDefined();
    expect((mod.dataSourceOptions as any).password).toBe('super-secure-prod-password');
  });
});
