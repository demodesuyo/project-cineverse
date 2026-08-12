/* Browser-only Supabase client. Never add a secret/service-role key here. */
(function initialiseSupabaseClient() {
  const config = window.CINEVERSE_SUPABASE_CONFIG || {};
  const url = typeof config.url === "string" ? config.url.trim() : "";
  const publishableKey = typeof config.publishableKey === "string" ? config.publishableKey.trim() : "";
  const state = { status: "unconfigured", client: null, error: null, ready: null };

  const loadLibrary = () => new Promise((resolve, reject) => {
    if (window.supabase?.createClient) { resolve(window.supabase); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.async = true;
    script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : reject(new Error("Supabase client was unavailable after loading."));
    script.onerror = () => reject(new Error("Supabase client could not be loaded."));
    document.head.append(script);
  });

  state.ready = (async () => {
    if (!url || !publishableKey) return null;
    try {
      const { createClient } = await loadLibrary();
      state.client = createClient(url, publishableKey, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
      });
      state.status = "ready";
      return state.client;
    } catch (error) {
      state.status = "error";
      state.error = error;
      return null;
    }
  })();

  window.CINEVERSE_SUPABASE = state;
})();
