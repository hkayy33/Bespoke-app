/**
 * Production: absolute API origin (static hosting on Vercel / CDN cannot proxy `/api`).
 * Supabase is not configured here — dev-only until production auth is set up separately.
 */
export const environment = {
  production: true,
  apiUrl: 'https://bespoke-app.fly.dev/api',
  duaUrl: 'https://bespoke-app.fly.dev/api/Dua',
  supabaseUrl: '',
  supabaseAnonKey: '',
};
