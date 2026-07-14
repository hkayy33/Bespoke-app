/**
 * Production: absolute API origin (static hosting on Vercel / CDN cannot proxy `/api`).
 */
export const environment = {
  production: true,
  apiUrl: 'https://bespoke-app.fly.dev/api',
  duaUrl: 'https://bespoke-app.fly.dev/api/Dua',
  /** App Store product URL from App Store Connect → Marketing. */
  appStoreUrl: 'https://apps.apple.com/gb/app/bespokedua/id6761731591',
};
