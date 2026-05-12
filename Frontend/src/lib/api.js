const LOCAL_BACKEND_URL = 'http://localhost:3000';

const normalizeUrl = (url) => {
  if (!url) return undefined;

  const trimmedUrl = url.trim().replace(/\/+$/, '');
  if (!trimmedUrl) return undefined;

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmedUrl)) {
    return `http://${trimmedUrl}`;
  }

  return `https://${trimmedUrl}`;
};

const isLocalhost = () => {
  if (typeof window === 'undefined') return import.meta.env.DEV;

  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

const configuredBackendUrl = normalizeUrl(import.meta.env.BACKEND_URI || import.meta.env.VITE_BACKEND_URI);
const shouldUseLocalBackend =
  import.meta.env.BACKEND_USE_LOCAL === 'true' || (isLocalhost() && !configuredBackendUrl);

export const BACKEND_URL = shouldUseLocalBackend
  ? LOCAL_BACKEND_URL
  : configuredBackendUrl || LOCAL_BACKEND_URL;

export const API_BASE_URL = `${BACKEND_URL}/api`;

const AUTH_TOKEN_KEY = 'frame_out_token';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const setAuthToken = (token) => {
  if (typeof window === 'undefined' || !token) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const attachAuthToken = (config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};
