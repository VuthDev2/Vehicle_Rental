// ============================================================
// PRODUCTION ENVIRONMENT
// The API base URL is a placeholder: set the real https domain
// here before deploying, OR override it at runtime by defining
// `window.__API_URL__` (e.g. from a config endpoint / CDN script)
// so no rebuild is required per environment.
// ============================================================
const runtimeApiUrl =
  typeof window !== 'undefined' && (window as any).__API_URL__
    ? (window as any).__API_URL__
    : 'http://localhost:5001/api';

export const environment = {
  production: true,
  apiUrl: runtimeApiUrl,
};
