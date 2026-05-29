import { supabaseSecrets } from './environment.secrets';

/** Dev-only Supabase config (imported from `environment.ts` only, not production). */
export const supabaseConfig = {
  supabaseUrl: supabaseSecrets.supabaseUrl?.trim() || 'https://vobqndulomomcglyvfyz.supabase.co',
  supabaseAnonKey: supabaseSecrets.supabaseAnonKey?.trim() || '',
};
