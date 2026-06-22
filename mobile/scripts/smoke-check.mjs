#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const requiredPaths = [
  'package.json',
  'app.json',
  'eas.json',
  '.env.example',
  'app/_layout.tsx',
  'app/emergency-mode.tsx',
  'app/report-problem.tsx',
  'app/sync-status.tsx',
  'app/settings.tsx',
  'src/lib/supabase.ts',
  'src/services/authService.ts',
  'src/services/syncService.ts',
  'src/lib/db.ts',
  '../supabase/schema.sql',
  '../docs/BETA_TEST_PLAN.md',
  '../docs/QA_TEST_MATRIX.md',
  '../docs/APP_STORE_PREP.md',
  '../docs/PRIVACY_AND_SAFETY_NOTES.md',
  '../docs/KNOWN_LIMITATIONS.md',
  '../docs/LAUNCH_CHECKLIST.md'
];

const errors = [];

for (const relativePath of requiredPaths) {
  const fullPath = path.resolve(root, relativePath);
  try {
    await fs.access(fullPath);
  } catch {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

const routeFile = path.resolve(root, 'app/_layout.tsx');
try {
  const layoutText = await fs.readFile(routeFile, 'utf8');
  const requiredRoutes = ['sync-status', 'emergency-mode', 'report-problem'];
  for (const route of requiredRoutes) {
    if (!layoutText.includes(route)) {
      errors.push(`Route missing in app/_layout.tsx: ${route}`);
    }
  }
} catch (error) {
  errors.push(`Unable to read route file: ${error.message}`);
}

const envFile = path.resolve(root, '.env.example');
try {
  const envText = await fs.readFile(envFile, 'utf8');
  const requiredEnvs = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY', 'EXPO_PUBLIC_APP_ENV'];
  for (const name of requiredEnvs) {
    if (!envText.includes(name)) {
      errors.push(`Missing env var in .env.example: ${name}`);
    }
  }
} catch {
  // already handled above
}

if (errors.length > 0) {
  console.error('Smoke check failed with the following issues:');
  for (const msg of errors) {
    console.error(`- ${msg}`);
  }
  process.exit(1);
}

console.log('Smoke check passed. Required files and routes are present.');
