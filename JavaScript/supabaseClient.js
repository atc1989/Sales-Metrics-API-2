// JavaScript/supabaseClient.js

let supabaseClientInstance = null;

function getSupabaseConfig() {
  const config = window.__APP_CONFIG__;
  if (!config || !config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error('Missing public/config.js with Supabase credentials.');
  }
  return config;
}

function getSupabase() {
  if (supabaseClientInstance) return supabaseClientInstance;

  if (!window.supabase || typeof window.supabase.createClient !== 'function') {
    throw new Error('Supabase client library is not loaded.');
  }

  const { SUPABASE_URL, SUPABASE_ANON_KEY } = getSupabaseConfig();
  supabaseClientInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClientInstance;
}

window.getSupabase = getSupabase;
