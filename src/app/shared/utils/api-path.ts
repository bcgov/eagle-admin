/** True when `url` is on this origin and its path is `base` or below it (`/api` matches `/api/x`, not `/apidocs`). */
export function isUnderPath(url: string, base: string): boolean {
  const origin = window.location.origin;
  const target = new URL(url, origin);
  const prefix = new URL(base, origin);
  const path = prefix.pathname.replace(/\/+$/, '');
  return target.origin === origin && prefix.origin === origin
    && (target.pathname === path || target.pathname.startsWith(`${path}/`));
}
