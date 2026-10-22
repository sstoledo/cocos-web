import { defineConfig, devices } from '@playwright/test';
import * as path from 'node:path';

// E2E stack: real browser against the real stack (Nest back :4000, Vite front
// :5173, Testcontainers-seeded Postgres via the cocos-postgres dev container).
// The back webServer entry drives the whole DB bootstrap (docker start →
// migrate deploy → base seeds → e2e users) before `start:dev`, so a cold run
// needs only Docker.

const FRONT_PORT = 5173;
const API_BASE_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';

const backDir = path.resolve(__dirname, '../../cocos-back');

const bootstrapBackCommand = [
  // Dev DB may be stopped; starting it is idempotent and safe when already up.
  'docker start cocos-postgres 2>/dev/null || true',
  `cd '${backDir}'`,
  'pnpm exec prisma migrate deploy',
  'pnpm exec ts-node prisma/seed.ts',
  'pnpm exec ts-node prisma/seed-demo.ts',
  'pnpm exec ts-node prisma/seed-e2e.ts',
  'pnpm start:dev',
].join(' && ');

export default defineConfig({
  testDir: './specs',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: `http://localhost:${FRONT_PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: bootstrapBackCommand,
      url: `${API_BASE_URL}/api/auth/get-session`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'pnpm --dir .. dev',
      url: `http://localhost:${FRONT_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
