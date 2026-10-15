import { describe, expect, it } from 'vitest';
import { validate } from './env.validation.js';

describe('Environment Validation', () => {
  it('should validate and convert valid configuration', () => {
    const validConfig = {
      NODE_ENV: 'development',
      PORT: '3001',
      DATABASE_HOST: 'localhost',
      DATABASE_PORT: '5432',
      DATABASE_NAME: 'hyper_resume_db',
      DATABASE_USER: 'postgres',
      DATABASE_PASSWORD: 'secretpassword',
    };

    const result = validate(validConfig);
    expect(result.PORT).toBe(3001);
    expect(result.DATABASE_PORT).toBe(5432);
    expect(result.DATABASE_NAME).toBe('hyper_resume_db');
  });

  it('should throw error when mandatory variables are missing', () => {
    const invalidConfig = {
      DATABASE_HOST: 'localhost',
      // Missing DATABASE_PASSWORD, DATABASE_NAME, etc.
    };

    expect(() => validate(invalidConfig)).toThrow('Configuration validation failed');
  });
});
