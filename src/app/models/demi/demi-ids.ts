const EAGLE_ID = /^[0-9a-f]{24}$/i;

/** True for a 24-hex Eagle (Mongo ObjectId) id; any other string is a DEMI id. DEMI by-id routes accept both. */
export function isEagleId(id: string | null | undefined): boolean {
  return typeof id === 'string' && EAGLE_ID.test(id);
}

/** Ids a row may carry: legacy `_id`, or native `id` and `eagleId`. */
export interface WriteIds {
  _id?: string | null;
  id?: string | null;
  eagleId?: string | null;
}

/**
 * Eagle id eagle-api writes the row under: a legacy `_id`, else the native `eagleId`, else a DEMI `id` that is itself
 * an Eagle id (mirrored rows keep it). Null means a row only DEMI holds, which is read-only here.
 */
export function eagleWriteId(row: WriteIds): string | null {
  return row._id || row.eagleId || (isEagleId(row.id) ? row.id : null);
}
