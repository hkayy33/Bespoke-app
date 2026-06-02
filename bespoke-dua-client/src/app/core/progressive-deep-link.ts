import { buildIosAuthDeepLink, DEEP_LINK_FALLBACK_MS } from '../../environments/auth-redirect.config';

/**
 * Try opening the native app, then run `onWebFallback` if the page is still visible.
 * Used when the user lands on the SPA `/auth/callback` route (not the static HTML page).
 */
export function tryProgressiveDeepLinkThenWeb(onWebFallback: () => void): void {
  if (typeof window === 'undefined') {
    onWebFallback();
    return;
  }

  const { search, hash } = window.location;

  if (!search && !hash) {
    onWebFallback();
    return;
  }

  const deepLink = buildIosAuthDeepLink(search, hash);

  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

  const cancelFallback = () => {
    if (fallbackTimer !== undefined) {
      clearTimeout(fallbackTimer);
      fallbackTimer = undefined;
    }
  };

  const onHidden = () => {
    if (document.visibilityState === 'hidden') {
      cancelFallback();
    }
  };

  document.addEventListener('visibilitychange', onHidden);

  fallbackTimer = setTimeout(() => {
    document.removeEventListener('visibilitychange', onHidden);
    if (document.visibilityState === 'hidden') {
      return;
    }
    onWebFallback();
  }, DEEP_LINK_FALLBACK_MS);

  window.location.href = deepLink;
}
