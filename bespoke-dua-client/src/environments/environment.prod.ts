import { supabaseConfig } from './supabase-config';

/**
 * Production: absolute API origin (static hosting on Vercel / CDN cannot proxy `/api`).
 * Supabase keys come from `environment.secrets.ts` (local) or CI env at build time.
 */
export const environment = {
  production: true,
  apiUrl: 'https://bespoke-app.fly.dev/api',
  duaUrl: 'https://bespoke-app.fly.dev/api/Dua',
  /** Must match Supabase → Authentication → Redirect URLs. */
  authRedirectUrl: 'https://www.bespokedua.com/auth/callback',
  iosAuthRedirectUrl: 'myapp://auth/callback',
  ...supabaseConfig,
};
