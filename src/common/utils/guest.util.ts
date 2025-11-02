import { randomBytes } from "crypto";
import { CookieKeys } from "../enums/cookie.enum";
import { Request } from "express";

export function generateGuestId(): string {
  const randomPart = randomBytes(16).toString("hex");
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${randomPart}`;
}

export function getOrCreateGuestId(req: Request): string {
  const guestId = req.cookies?.[CookieKeys.GuestId];
  if (guestId && typeof guestId === "string") {
    return guestId;
  }
  return generateGuestId();
}

export function getGuestId(req: Request): string | null {
  const guestId = req.cookies?.[CookieKeys.GuestId];
  return guestId && typeof guestId === "string" ? guestId : null;
}
