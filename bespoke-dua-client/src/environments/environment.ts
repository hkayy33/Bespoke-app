/**
 * Local development: use same-origin `/api` so `ng serve` can proxy to the .NET API
 * (see `proxy.conf.json` — matches API PORT default http://localhost:8080).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  duaUrl: '/api/Dua',
};
