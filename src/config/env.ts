import { z } from 'zod';

/**
 * Environment contract. Parsed once at module load so a misconfigured deploy
 * fails immediately and loudly instead of surfacing as a confusing 404 later.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_APP_URL: z.string().url('VITE_APP_URL must be a valid URL').optional(),
  VITE_AUTH_MODE: z.enum(['token', 'cookie']).default('token'),
  VITE_APP_NAME: z.string().min(1).default('School ERP'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env.`);
}

const raw = parsed.data;

export const env = {
  apiBaseUrl: raw.VITE_API_BASE_URL.replace(/\/+$/, ''),
  appUrl: (raw.VITE_APP_URL ?? raw.VITE_API_BASE_URL.replace(/\/api\/?$/, '')).replace(/\/+$/, ''),
  authMode: raw.VITE_AUTH_MODE,
  appName: raw.VITE_APP_NAME,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type Env = typeof env;
