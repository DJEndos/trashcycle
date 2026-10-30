const REQUIRED = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];

// Stop at startup, with a clear message, if a required setting is missing.
export function validateEnv() {
  for (const k of REQUIRED) {
    if (!process.env[k]) { console.error(`Missing env var ${k}`); process.exit(1); }
  }
}
