/*
 * This committed fallback intentionally contains no credentials.
 * `scripts/build-pages.mjs` replaces it in the GitHub Pages artifact using
 * SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY. The publishable key is safe to
 * expose only because the database migration enables RLS and grants read-only
 * public policies.
 */
window.CINEVERSE_SUPABASE_CONFIG = Object.freeze({
  url: "",
  publishableKey: ""
});
