import * as fs from 'node:fs';
import * as path from 'node:path';

const backendEnvPath = path.resolve(__dirname, '../../../cocos-back/.env');
const keyLine = fs.existsSync(backendEnvPath)
  ? /^GEMINI_API_KEY=(.*)$/m.exec(fs.readFileSync(backendEnvPath, 'utf8'))
  : null;
const keyValue = keyLine?.[1]?.trim() ?? '';

// Presence-only inspection: neither the key nor the rest of the backend
// environment is exposed. The template placeholder is not a live provider
// configuration and must not enable provider-dependent tests in CI.
export const hasConfiguredGeminiKey =
  keyValue.length > 0 && keyValue !== 'your_gemini_api_key';
