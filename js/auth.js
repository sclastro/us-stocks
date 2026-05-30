'use strict';

/* ── Supabase client ─────────────────────────────────────────────────────────
 * Requires supabase-js UMD loaded before this file (window.supabase).
 * Requires CONFIG.SUPA_URL / CONFIG.SUPA_KEY set in config.js.
 * ─────────────────────────────────────────────────────────────────────────── */
const sbClient = window.supabase.createClient(CONFIG.SUPA_URL, CONFIG.SUPA_KEY);

let _currentUser = null;

/* ── Public helpers ────────────────────────────── */
function isLoggedIn() { return _currentUser !== null; }
function getUser()    { return _currentUser; }
function getUserId()  { return _currentUser?.id ?? null; }

/* ── Init (call once per page, await it) ─────────
 * Loads session from storage, updates nav.
 * ─────────────────────────────────────────────── */
async function initAuth() {
  const { data: { session } } = await sbClient.auth.getSession();
  _currentUser = session?.user ?? null;
  _updateNavAuth();

  sbClient.auth.onAuthStateChange((_event, sess) => {
    _currentUser = sess?.user ?? null;
    _updateNavAuth();
  });

  /* Bind logout button (present on every page) */
  document.getElementById('navLogoutBtn')
    ?.addEventListener('click', authSignOut);
}

/* ── Nav UI ──────────────────────────────────────
 * Toggles login link ↔ user chip in nav-right.
 * ─────────────────────────────────────────────── */
function _updateNavAuth() {
  const loginBtn  = document.getElementById('navLoginBtn');
  const userWrap  = document.getElementById('navUserWrap');
  const userLabel = document.getElementById('navUserName');

  if (!loginBtn) return; // login.html has no nav-auth

  if (_currentUser) {
    loginBtn.hidden = true;
    if (userWrap)  userWrap.hidden = false;
    if (userLabel) {
      /* Show name part before @ */
      userLabel.textContent = _currentUser.email.split('@')[0];
      userLabel.title       = _currentUser.email;
    }
  } else {
    loginBtn.hidden = false;
    if (userWrap) userWrap.hidden = true;
  }
}

/* ── Auth operations ─────────────────────────── */
async function authSignIn(email, password) {
  const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function authSignUp(email, password) {
  const { data, error } = await sbClient.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function authSignOut() {
  await sbClient.auth.signOut();
  /* Reload current page so watchlist/portfolio refreshes to guest mode */
  window.location.reload();
}
