/* Supabase client + sticker helpers
 *
 * 👉 Preencha estes valores com o seu projeto Supabase
 *    Dashboard → Project Settings → API
 */
const SUPABASE_URL = "https://devedwxgmkgbwoduxlab.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_X4rDJPOg9oGwT_Rnp-jz8w_Z_Sx51km";

const SUPABASE_CONFIGURED =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  SUPABASE_URL !== "SUA_URL_AQUI" &&
  SUPABASE_ANON_KEY !== "SUA_ANON_KEY_AQUI" &&
  /^https?:\/\//.test(SUPABASE_URL);

// Instancia o client global (apenas se configurado)
const supabase = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit",
      },
    })
  : null;

// ---------- Stickers API ----------

async function fetchStickers(userId) {
  const { data, error } = await supabase
    .from("stickers")
    .select("sticker_code")
    .eq("user_id", userId);

  if (error) throw error;

  const map = {};
  (data || []).forEach((row) => { map[row.sticker_code] = true; });
  return map;
}

async function addSticker(userId, code) {
  const { error } = await supabase
    .from("stickers")
    .insert({ user_id: userId, sticker_code: code });
  if (error) throw error;
}

async function removeSticker(userId, code) {
  const { error } = await supabase
    .from("stickers")
    .delete()
    .eq("user_id", userId)
    .eq("sticker_code", code);
  if (error) throw error;
}

// ---------- Auth API ----------

async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

async function signUp(email, password) {
  return supabase.auth.signUp({ email, password });
}

async function signOut() {
  return supabase.auth.signOut();
}

async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return data.subscription;
}

Object.assign(window, {
  supabaseClient: supabase,
  SUPABASE_CONFIGURED,
  fetchStickers, addSticker, removeSticker,
  signIn, signUp, signOut, getSession, onAuthChange,
});
