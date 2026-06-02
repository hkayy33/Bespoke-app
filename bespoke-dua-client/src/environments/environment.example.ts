/**
 * Copy values into environment.ts / environment.prod.ts (or use build-time env injection).
 *
 * Supabase → Authentication → URL Configuration:
 * - Site URL: https://www.bespokedua.com
 * - Redirect URLs: https://www.bespokedua.com/auth/callback
 *   (and http://localhost:4200/auth/callback for local dev)
 * - Enable “Email” provider; password reset emails use the same redirect URL.
 */
export const environmentExample = {
  production: false,
  apiUrl: '/api',
  duaUrl: '/api/Dua',
  supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
};
