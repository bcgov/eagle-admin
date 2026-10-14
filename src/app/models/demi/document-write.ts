/** Ids a document row carries, legacy (`_id`, `project`) or native (`eagleId`, `projectEagleId`). */
export interface DocumentWriteIds {
  _id?: string | null;
  project?: string | null;
  eagleId?: string | null;
  projectEagleId?: string | null;
}

/** Eagle document id for an eagle-api write. Null means a DEMI-only row, which is read-only here. */
export function eagleWriteId(row: DocumentWriteIds): string | null {
  return row._id || row.eagleId || null;
}

/** Eagle project id for an eagle-api document write. Null also when the caller cannot read the parent project: refuse the write then. */
export function eagleWriteProjectId(row: DocumentWriteIds): string | null {
  return row.project || row.projectEagleId || null;
}
