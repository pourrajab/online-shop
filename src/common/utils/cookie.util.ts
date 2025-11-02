import { cookieDefaults, ttl } from "src/config/app.config";
import * as cookieParser from "cookie-parser";

export function CookiesOptionsToken() {
  return {
    ...cookieDefaults,
    expires: new Date(Date.now() + ttl.otpMs),
  };
}

export function RefreshCookieOptions() {
  return {
    ...cookieDefaults,
    expires: new Date(Date.now() + ttl.refreshMs),
  };
}

export function GuestIdCookieOptions() {
  return {
    ...cookieDefaults,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  };
}

export function parseCookies(cookieHeader: string): Record<string, string> {
  if (!cookieHeader || cookieHeader.trim() === "") {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookieSecret = process.env.COOKIE_SECRET || "";

  cookieHeader.split(/;\s*/).forEach((cookie) => {
    if (!cookie) return;

    const idx = cookie.indexOf("=");
    if (idx === -1) return;

    const key = cookie.slice(0, idx).trim();
    let value = cookie.slice(idx + 1);

    try {
      value = decodeURIComponent(value);
    } catch {}

    if (cookieSecret && value.startsWith("s:")) {
      const unsigned = cookieParser.signedCookie(value, cookieSecret);
      if (unsigned !== false) {
        cookies[key] = unsigned;
      } else {
        return;
      }
    } else {
      cookies[key] = value;
    }
  });

  return cookies;
}
