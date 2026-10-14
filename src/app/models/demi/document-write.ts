/** Ids a document row carries, legacy (`_id`, `project`) or native (`eagleId`, `projectEagleId`). */
export interface DocumentWriteIds {
  _id?: string | null;
  project?: string | null;
  eagleId?: string | null;
  projectEagleId?: string | null;
}

/** Eagle project id for an eagle-api document write. Null also when the caller cannot read the parent project: refuse the write then. */
export function eagleWriteProjectId(row: DocumentWriteIds): string | null {
  return row.project || row.projectEagleId || null;
}
