import { environment } from './environment';

/** Custom URL scheme registered in the iOS app (Info.plist → URL Types). */
export const IOS_APP_URL_SCHEME = 'myapp';

/** Web path Supabase should redirect to after email confirmation. */
export const AUTH_CALLBACK_PATH = '/auth/callback';

/** Milliseconds to wait before assuming the native app did not open. */
export const DEEP_LINK_FALLBACK_MS = 1500;

export function getAuthCallbackUrl(origin?: string): string {
  const base =
    origin ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.bespokedua.com');
  return `${base.replace(/\/$/, '')}${AUTH_CALLBACK_PATH}`;
}

export function buildIosAuthDeepLink(search: string, hash: string): string {
  const suffix = search || hash || '';
  const base =
    environment.iosAuthRedirectUrl ?? `${IOS_APP_URL_SCHEME}://auth/callback`;
  return `${base}${suffix}`;
}

export function buildWebAuthFallbackUrl(origin?: string, search = '', hash = ''): string {
  const base =
    origin ??
    (typeof window !== 'undefined' ? window.location.origin : 'https://www.bespokedua.com');
  return `${base.replace(/\/$/, '/')}${search}${hash}`;
}
