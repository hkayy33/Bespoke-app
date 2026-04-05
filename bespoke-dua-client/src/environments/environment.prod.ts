/**
 * Production: absolute API origin (static hosting on Vercel / CDN cannot proxy `/api`).
 */
export const environment = {
  production: true,
  apiUrl: 'https://bespoke-app.fly.dev/api',
  duaUrl: 'https://bespoke-app.fly.dev/api/Dua',
};
