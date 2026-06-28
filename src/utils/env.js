// src/utils/env.js
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

export function validateEnv() {
  const missing = required.filter(k => !import.meta.env[k]);
  if (missing.length > 0) {
    const msg = [
      '─────────────────────────────────────────',
      '  Missing required environment variables:',
      ...missing.map(k => `  ❌ ${k}`),
      '',
      '  Add them to .env.local for development',
      '  or Vercel → Settings → Environment Variables',
      '─────────────────────────────────────────',
    ].join('\n');
    console.warn(msg);
  }
}

export const env = {
  siteUrl:              import.meta.env.VITE_SITE_URL ?? 'https://eduvault.com',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '',
  isDev:                import.meta.env.DEV,
  isProd:               import.meta.env.PROD,
};
