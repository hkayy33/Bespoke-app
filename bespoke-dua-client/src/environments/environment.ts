/**
 * Local development: use same-origin `/api` so `ng serve` can proxy to the .NET API
 * (see `proxy.conf.json` — default profile uses http://localhost:5248).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  duaUrl: '/api/Dua',
};
