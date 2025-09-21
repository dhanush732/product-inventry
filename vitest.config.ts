import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      reportsDirectory: './coverage'
    }
  },
  resolve: {
    alias: {
      '@domain': '/src/domain',
      '@app': '/src/app',
      '@infra': '/src/infra',
      '@ui': '/src/ui',
      '@tests': '/tests'
    }
  }
});
