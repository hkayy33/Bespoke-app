/**
 * Local development: use same-origin `/api` so `ng serve` can proxy to the .NET API
 * (see `proxy.conf.json` — default profile uses http://localhost:5248).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  duaUrl: '/api/Dua',
  /** App Store product URL from App Store Connect → Marketing. */
  appStoreUrl: 'https://apps.apple.com/gb/app/bespoke-dua/id6761731591',
};

