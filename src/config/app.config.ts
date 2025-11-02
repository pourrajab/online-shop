export const isProd = process.env.NODE_ENV === "production";

export const cookieDefaults = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: isProd,
};

export const ttl = {
  otpMs: 1000 * 60 * 2,
  refreshMs: 1000 * 60 * 60 * 24 * 30,
};
