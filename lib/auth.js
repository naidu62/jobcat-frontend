// lib/auth.js
// Client-side authentication for JobCat (Django SimpleJWT backend).

import { API_BASE } from "./api";

const ACCESS_KEY = "jobcat_access";
const REFRESH_KEY = "jobcat_refresh";
const USER_KEY = "jobcat_user";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuth({ access, refresh, user }) {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

// Exchange refresh token for new tokens (backend rotates refresh tokens).
//
// Concurrency-safe: all 401'd calls share ONE in-flight refresh request, so
// parallel dashboard calls can never race each other into blacklisting the
// rotating refresh token (which previously logged users out spuriously).
let _refreshInFlight = null;

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  // Keep the Header (and anything listening) in sync instantly.
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("jobcat-auth-sync"));
  }
}

export async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  // Join the in-flight refresh instead of starting a competing one.
  if (_refreshInFlight) return _refreshInFlight;

  // Snapshot the current access token: if it changes while we are refreshing,
  // another tab has already rotated the pair successfully and we should adopt
  // the new tokens instead of logging out.
  const staleAccess = getAccessToken();

  _refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuth(data); // stores rotated refresh token too
        return data.access ?? null;
      }

      // Refresh rejected. Another tab may have rotated the pair in the
      // meantime — if the stored access token changed since we started,
      // adopt it rather than forcing a logout.
      const current = getAccessToken();
      if (current && current !== staleAccess) return current;

      // Genuinely dead session (invalid/expired/blacklisted refresh).
      clearAuth();
      return null;
    } catch {
      // Network error: transient — do NOT clear the session.
      return null;
    } finally {
      _refreshInFlight = null;
    }
  })();

  return _refreshInFlight;
}

// fetch wrapper that attaches the access token and retries once on 401.
export async function authFetch(endpoint, options = {}) {
  const url = `${API_BASE}/${String(endpoint).replace(/^\//, "")}`;

  // Multipart uploads must NOT set Content-Type manually (browser adds boundary).
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const doFetch = (token) =>
    fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(getAccessToken());

  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await doFetch(newAccess);
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail =
      data?.detail ||
      Object.values(data || {}).flat().join(" ") ||
      `Request failed (${res.status})`;
    throw new Error(detail);
  }

  return data;
}

// Structured auth error so pages can react to specific backend codes
// (e.g. "email_not_verified" -> show the verify / resend panel).
export class AuthError extends Error {
  constructor(message, code = null, meta = {}) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.meta = meta;
  }
}

function extractTokens(data) {
  return { access: data?.access, refresh: data?.refresh };
}

function parseErrorResponse(data, fallback) {
  const detail =
    data?.detail ||
    Object.values(data || {}).flat().filter((v) => typeof v === "string").join(" ") ||
    fallback;
  return { message: detail, code: data?.code || null };
}

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const { message, code } = parseErrorResponse(data, "Login failed");
    throw new AuthError(message, code, { email: data?.email });
  }

  setAuth({ ...extractTokens(data), user: data.user });
  return data;
}

/**
 * Registration no longer signs the user in: the account is created inactive
 * and must be activated through the emailed verification link.
 */
export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const { message } = parseErrorResponse(data, "Registration failed");
    throw new AuthError(message);
  }

  // Deliberately NOT calling setAuth(): tokens are issued after verification.
  return data;
}

export async function resendVerification(email) {
  const res = await fetch(`${API_BASE}/auth/resend-verification/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { message } = parseErrorResponse(data, "Could not resend verification email.");
    throw new AuthError(message);
  }
  return data;
}

/** Exchange a Google Identity Services credential for JobCat JWTs. */
export async function googleLogin(credential) {
  const res = await fetch(`${API_BASE}/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { message, code } = parseErrorResponse(data, "Google sign-in failed.");
    throw new AuthError(message, code);
  }
  setAuth({ ...extractTokens(data), user: data.user });
  return data;
}

export async function requestPasswordReset(email) {
  const res = await fetch(`${API_BASE}/auth/password/reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const { message } = parseErrorResponse(data, "Could not send reset email.");
    throw new AuthError(message);
  }
  return data;
}

// Best-effort server logout (blacklists refresh), always clears local state.
export async function logoutUser() {
  const refresh = getRefreshToken();
  try {
    if (refresh) {
      await authFetch("auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    }
  } catch {
    // ignore — local session is cleared regardless
  } finally {
    clearAuth();
  }
}

// ---------------------------------------------------------------------------
// Account system (Phase 1)
// ---------------------------------------------------------------------------

/** Full profile record (avatar, phone, location, education, ...). */
export async function fetchProfile() {
  return authFetch("auth/me/profile/");
}

/** PATCH the logged-in user + nested profile. Returns updated user object. */
export async function updateAccount(payload) {
  const data = await authFetch("auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (data) localStorage.setItem(USER_KEY, JSON.stringify(data));
  return data;
}

/** Upload avatar image (File/Blob). Returns { avatar_url, ...profile }. */
export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  return authFetch("auth/me/avatar/", { method: "POST", body: form });
}

export async function removeAvatar() {
  return authFetch("auth/me/avatar/", { method: "DELETE" });
}

/**
 * Change password (password accounts only). Server blacklists every refresh
 * token, so the local session is cleared and the user must sign in again.
 */
export async function changePassword({ currentPassword, newPassword, newPasswordConfirm }) {
  try {
    await authFetch("auth/me/password/", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }),
    });
  } finally {
    // All sessions are invalidated server-side regardless.
    clearAuth();
  }
}

/** Absolute URL for a possibly-relative media path (e.g. /media/avatars/...). */
export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE.replace(/\/api\/?$/, "")}${url}`;
}
