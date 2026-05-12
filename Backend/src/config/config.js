import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in environment variables",
  );
}

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

if (!process.env.REDIS_PASSWORD) {
  throw new Error("REDIS_PASSWORD is not defined in environment variables");
}

if (!process.env.REDIS_PORT) {
  throw new Error("REDIS_PORT is not defined in environment variables");
}
if (!process.env.REDIS_HOST) {
  throw new Error("REDIS_HOST is not defined in environment variables");
}

if (!process.env.MISTRAL_API_KEY) {
  console.warn("⚠️  MISTRAL_API_KEY is not set — AI endpoints will not work");
}
const LOCAL_FRONTEND_URLS = ["http://localhost:5173", "http://localhost:5174"];

const normalizeFrontendUrl = (url) => {
  if (!url) return undefined;

  const trimmedUrl = url.trim().replace(/\/+$/, "");
  if (!trimmedUrl) return undefined;

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmedUrl)) {
    return `http://${trimmedUrl}`;
  }

  return `https://${trimmedUrl}`;
};

const frontendUrl = normalizeFrontendUrl(process.env.FRONTEND_URL) || LOCAL_FRONTEND_URLS[0];

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  FRONTEND_URL: frontendUrl,
  LOCAL_FRONTEND_URL: LOCAL_FRONTEND_URLS[0],
  FRONTEND_ORIGINS: Array.from(new Set([frontendUrl, ...LOCAL_FRONTEND_URLS])),
};

export const getFrontendUrl = (req) => {
  const requestOrigin = normalizeFrontendUrl(req?.get?.("origin") || req?.headers?.origin);

  if (requestOrigin && config.FRONTEND_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }

  return config.NODE_ENV === "development" ? config.LOCAL_FRONTEND_URL : config.FRONTEND_URL;
};
