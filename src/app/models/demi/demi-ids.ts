const EAGLE_ID = /^[0-9a-f]{24}$/i;

/** True for a 24-hex Eagle (Mongo ObjectId) id; any other string is a DEMI id. DEMI by-id routes accept both. */
export function isEagleId(id: string | null | undefined): boolean {
  return typeof id === 'string' && EAGLE_ID.test(id);
}
