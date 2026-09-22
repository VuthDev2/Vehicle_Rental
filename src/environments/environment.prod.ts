// ============================================================
// PRODUCTION ENVIRONMENT
// Values are injected by the CI/CD build pipeline via the
// build command:
//   npm run build:prod
// which calls the `set-env.js` prebuild script to write the
// real values from process.env into this file before compiling.
// NEVER hardcode real URLs or credentials here.
// ============================================================
export const environment = {
  production: true,
  apiUrl: 'PLACEHOLDER_API_URL',
  googleClientId: 'PLACEHOLDER_GOOGLE_CLIENT_ID',
};
