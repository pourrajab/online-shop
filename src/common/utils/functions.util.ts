export const createSlug = (str: string) => {
  if (!str) return "";
  const withDashes = String(str)
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-");
  return (
    withDashes
      .replace(/[،ًٌٍُِ\.\+_)(*&^%$#@!~'";:?><«»`ء]+/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
};
export const randomId = () => Math.random().toString(36).substring(2);

export function isBoolean(value: unknown): boolean {
  return ["false", false, "true", true].includes(value as string | boolean);
}
export function toBoolean(value: unknown): boolean {
  return [true, "true"].includes(value as boolean | string)
    ? true
    : [false, "false"].includes(value as boolean | string)
      ? false
      : Boolean(value);
}
