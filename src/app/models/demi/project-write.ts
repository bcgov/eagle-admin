import { Project } from '../project';
import { List } from './list';
import { DemiListRef } from './project';

/** Eagle field names DEMI stores under another top-level name (DEMI `EAGLE_BLOCK_NAMES`, `vis/catalog/projects.js`). */
export const DEMI_FIELD_NAMES = Object.freeze({
  type: 'projectType',
  status: 'projectState',
  location: 'address',
  shortName: 'abbreviation',
  activeStatus: 'isActive',
  proponent: 'proponentId'
} as const);

/** Fields eagle-api's PUT wrote on every save: one the form left empty is sent as null, so DEMI clears it. */
const CLEARED_FIELDS = [
  'name', 'description', 'sector', 'region', 'build', 'CEAALink', 'eaStatus', 'eaStatusDate', 'decisionDate',
  'substantially', 'substantiallyDate', 'dispute', 'disputeDate', 'intake', 'responsibleEPDId', 'projectLeadId',
  'type', 'status', 'location', 'proponent', 'centroid', 'eacDecision', 'currentPhaseName', 'CEAAInvolvement'
] as const;

/** Fields eagle-api's PUT left alone: sent only when set. */
const SET_FIELDS = ['legislationYear', 'shortName', 'activeStatus', 'applicableRegulation'] as const;

const CLEARED = new Set<string>(CLEARED_FIELDS);
const LIST_REFS = new Set<string>(['eacDecision', 'currentPhaseName', 'CEAAInvolvement', 'applicableRegulation']);

type WriteField = typeof CLEARED_FIELDS[number] | typeof SET_FIELDS[number];

/**
 * The DEMI `PUT /projects/:id` body for an edit form's `Project`: only catalogued top-level fields, under DEMI's
 * names. `_id` and every other key are left out, since DEMI answers 400 to a key it does not catalogue.
 */
export function toDemiProjectWrite(project: Project, lists: List[]): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const field of [...CLEARED_FIELDS, ...SET_FIELDS]) {
    const value = valueOf(project, field, lists);
    if (value !== undefined || CLEARED.has(field)) {
      body[DEMI_FIELD_NAMES[field as keyof typeof DEMI_FIELD_NAMES] ?? field] = value ?? null;
    }
  }
  if (project.proponent?.name) {
    body.proponentName = project.proponent.name;
  }
  return body;
}

function valueOf(project: Project, field: WriteField, lists: List[]): unknown {
  const value = project[field];
  if (LIST_REFS.has(field)) {
    return value ? listRef(value, lists) : undefined;
  }
  switch (field) {
    // eagle-api's PUT took the stage from the phase; the form never sends `status`.
    case 'status':
      return value ?? (project.currentPhaseName ? listRef(project.currentPhaseName, lists).name : undefined);
    case 'proponent':
      return value && typeof value === 'object' ? value._id : value;
    case 'centroid':
      return point(value);
    case 'intake':
      return value ? { investment: value.investment, investmentNotes: value.notes ?? value.investmentNotes } : undefined;
    // Stored escaped, as eagle-api's save always sent it.
    case 'description':
      return value?.replace(/\n/g, '\\n');
    default:
      return value;
  }
}

/** The ref DEMI stores for a List pick. The form holds the List id; a row read back already holds the ref. */
function listRef(value: string | DemiListRef, lists: List[]): DemiListRef {
  const id = typeof value === 'string' ? value : value._id;
  const row = lists.find(item => item.id === id);
  if (!row) {
    return typeof value === 'string' ? { _id: id, name: null } : value;
  }
  return { _id: row.id, name: row.name, type: row.type, legislation: row.legislation };
}

/** `[lon, lat]` as the GeoJSON point DEMI stores; undefined when either is blank. */
function point(centroid: unknown[] | undefined): { type: 'Point'; coordinates: number[] } | undefined {
  const coordinates = (centroid ?? []).map(value => (value === '' || value == null ? NaN : Number(value)));
  return coordinates.length === 2 && coordinates.every(Number.isFinite) ? { type: 'Point', coordinates } : undefined;
}
