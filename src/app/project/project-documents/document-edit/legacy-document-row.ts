import { DemiDocument, DemiDocumentFilters } from 'src/app/models/demi/document';
import { eagleWriteId } from 'src/app/models/demi/demi-ids';
import { eagleWriteProjectId } from 'src/app/models/demi/document-write';

/**
 * Document row in the Eagle field names the edit form and document pickers read.
 * A row with `_id` is legacy and comes back unchanged; a native row maps its list ids and Eagle ids,
 * with `_id` null when it has no Eagle record.
 */
export function legacyDocumentRow(row: any): any {
  if (row._id || !row.id) { return row; }
  const doc = row as DemiDocument;
  return {
    ...doc,
    _id: eagleWriteId(doc),
    project: eagleWriteProjectId(doc),
    type: doc.typeId ?? null,
    milestone: doc.milestoneId ?? null,
    projectPhase: doc.projectPhaseId ?? null,
    documentAuthorType: doc.documentAuthorTypeId ?? null
  };
}

/**
 * Whether a mapped row may be linked, published or deleted on a screen for `documentSource` documents.
 * Those writes go to eagle-api by Eagle id, and `GET /documents` also returns other sources, such as comment attachments.
 */
export function isSelectableDocument(row: { _id?: string | null; documentSource?: string }, documentSource: string): boolean {
  return !!row._id && row.documentSource === documentSource;
}

/** `GET /documents` filters for one parent's documents of one `documentSource`. */
export function sourceFilters(project: string, documentSource: string): DemiDocumentFilters {
  return { project, documentSource };
}

/** Table sort (`-datePosted`, `+sortOrder`) as a native documents `sort`; keys DEMI cannot sort by are dropped. */
export function nativeDocumentSort(sortBy: string | null | undefined): string | undefined {
  const key = sortBy?.replace(/^\+/, '');
  return key && /^-?(datePosted|displayName|sortOrder)$/.test(key) ? key : undefined;
}
