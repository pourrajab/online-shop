export type CookiePayload = {
  userId: number;
};
export type AccessTokenPayload = {
  userId: number;
};
export type EmailTokenPayload = {
  email: string;
};
export type PhoneTokenPayload = {
  phone: string;
};
export type UsernameTokenPayload = {
  userId: number;
  username: string;
  role: string;
};
