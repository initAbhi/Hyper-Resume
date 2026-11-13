import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 45000,
    hookTimeout: 45000,
    env: {
      NODE_ENV: 'test',
      PAYMENT_PROVIDER: 'sandbox',
      AI_PROVIDER: 'mock',
    },
  },
});
