import { Project } from '../project';
import { projectTypeKey } from '../../shared/utils/utils';
import { List } from './list';
import { DemiListRef, DemiProject } from './project';

/** Eagle field names DEMI stores under another top-level name (DEMI `EAGLE_BLOCK_NAMES`, `vis/catalog/projects.js`). */
export const DEMI_FIELD_NAMES = Object.freeze({
  type: 'projectType',
  status: 'projectState',
  location: 'address',
  shortName: 'abbreviation',
  activeStatus: 'isActive',
  proponent: 'proponentId'
} as const);

/** Fields eagle-api's PUT wrote on every save: one the user emptied is sent as null, so DEMI clears it. */
const CLEARED_FIELDS = [
  'name', 'description', 'sector', 'region', 'build', 'CEAALink', 'eaStatus', 'eaStatusDate', 'decisionDate',
  'substantially', 'substantiallyDate', 'dispute', 'disputeDate', 'intake', 'responsibleEPDId', 'projectLeadId',
  'type', 'status', 'location', 'proponent', 'centroid', 'eacDecision', 'currentPhaseName', 'CEAAInvolvement'
] as const;

/** Fields eagle-api's PUT left alone: sent only when set. */
const SET_FIELDS = ['legislationYear', 'shortName', 'activeStatus', 'applicableRegulation'] as const;

const CLEARED = new Set<string>(CLEARED_FIELDS);
const LIST_REFS = new Set<string>(['eacDecision', 'currentPhaseName', 'CEAAInvolvement', 'applicableRegulation']);

/** Contact name fields DEMI keeps beside each contact id: cleared with the id. */
const CONTACT_NAMES = { responsibleEPDId: 'responsibleEPD', projectLeadId: 'projectLead' } as const;

type WriteField = typeof CLEARED_FIELDS[number] | typeof SET_FIELDS[number];

/** The edit form's lon and lat for a project with no location; create needs a point, as DEMI refuses a project without one. */
export const DEFAULT_CENTROID: readonly [number, number] = [-123.3656, 48.4284];

// valueOf's answer for a field the save must leave out, so DEMI keeps the stored value.
const KEEP = Symbol('keep');
const DATE_FIELDS = new Set<string>(['eaStatusDate', 'decisionDate', 'substantiallyDate', 'disputeDate']);

/** A List ref as DEMI stores it; `item` is the List row's link, such as a BC Laws URL. */
type WriteListRef = DemiListRef & { item?: string };

/**
 * DEMI `PUT /projects/:id` body over `row`, catalogued fields under DEMI's names (DEMI answers 400 to others such as `_id`).
 * A cleared field outside `held` (the saving form's fields), or empty in form and row, is left out, so DEMI keeps it.
 */
export function toDemiProjectWrite(project: Project, lists: List[], row: DemiProject, held?: readonly string[]): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const field of [...CLEARED_FIELDS, ...SET_FIELDS]) {
    const name = DEMI_FIELD_NAMES[field as keyof typeof DEMI_FIELD_NAMES] ?? field;
    // The stage follows the phase, so it is held with it.
    const holder = field === 'status' ? 'currentPhaseName' : field;
    if (CLEARED.has(field) && held && !held.includes(holder)) {
      continue;
    }
    const value = valueOf(project, field, lists, row);
    if (value === KEEP || (value == null && isEmpty(row[name]))) {
      continue;
    }
    if (value !== undefined || CLEARED.has(field)) {
      body[name] = value ?? null;
    }
  }
  for (const [idField, nameField] of Object.entries(CONTACT_NAMES)) {
    if (body[idField] === null) {
      body[nameField] = null;
    }
  }
  if (project.proponent?.name) {
    body.proponentName = project.proponent.name;
  }
  const phase = body.currentPhaseName as WriteListRef | null;
  const history = Array.isArray(row.phaseHistory) ? row.phaseHistory : [];
  const last = history.length ? history[history.length - 1] : row.currentPhaseName;
  // eagle-api's PUT appended a phase that differs from the last one in the history.
  if (phase && phase._id !== (last && typeof last === 'object' ? (last as DemiListRef)._id : last)) {
    body.phaseHistory = [...history, phase];
  }
  return body;
}

function valueOf(project: Project, field: WriteField, lists: List[], row: DemiProject): unknown {
  const value = project[field];
  if (LIST_REFS.has(field)) {
    // The stored ref's id picked again leaves the stored ref, with keys such as listOrder, as it is.
    // A List row with no `_id` is a form default the user did not pick.
    if (sameRef(value, row[field]) || (value && !refId(value))) {
      return KEEP;
    }
    return value ? listRef(value, lists) : undefined;
  }
  switch (field) {
    // eagle-api's PUT took the stage from the phase; the form never sends `status`.
    // An unchanged phase leaves the stored stage alone too.
    case 'status':
      if (value === undefined && project.currentPhaseName && (sameRef(project.currentPhaseName, row.currentPhaseName) || !refId(project.currentPhaseName))) {
        return KEEP;
      }
      return value ?? (project.currentPhaseName ? listRef(project.currentPhaseName, lists).name : undefined);
    case 'proponent':
      return value && typeof value === 'object' ? value._id : value;
    // The form shows the default point on a stored row with none; that is not the user's pick.
    case 'centroid':
      return row.id && !row.centroid?.coordinates?.length && sameCoordinates(value, DEFAULT_CENTROID) ? KEEP : point(value);
    // Over the stored object, so keys the form does not edit stay.
    case 'intake': {
      const notes = value?.notes ?? value?.investmentNotes;
      if (!value) {
        return undefined;
      }
      const storedObject = !!row.intake && typeof row.intake === 'object';
      // Nothing entered over no intake, or over one eagle-api stored as a string or number, leaves it as stored.
      if (isEmpty(value.investment) && isEmpty(notes) && !storedObject) {
        return KEEP;
      }
      const stored = (storedObject ? row.intake : {}) as Record<string, unknown>;
      // A key the stored intake lacks is added only when the form has a value for it.
      const put = (key: string, entered: unknown) => (key in stored || !isEmpty(entered) ? { [key]: entered ?? null } : {});
      return { ...stored, ...put('investment', value.investment), ...put('investmentNotes', notes) };
    }
    // `new Project` drops a No answer, so a stored false or null stays; a stored Yes becomes false.
    case 'substantially':
    case 'dispute':
      return value || (row[field] ? false : KEEP);
    // The picker key differs from Track's stored type only in spacing; keep the stored one.
    case 'type':
      return value && projectTypeKey(row.projectType) === value ? KEEP : value;
    default:
      // The form shows a date as the local day; the same day back keeps the stored time and zone.
      return DATE_FIELDS.has(field) && sameLocalDay(value, row[field]) ? KEEP : value;
  }
}

const isEmpty = (value: unknown) => value == null || value === '';

function sameLocalDay(a: unknown, b: unknown): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const [x, y] = [new Date(a), new Date(b)];
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

function sameCoordinates(centroid: unknown[] | undefined, [lon, lat]: readonly number[]): boolean {
  return Number(centroid?.[0]) === lon && Number(centroid?.[1]) === lat;
}

/** Whether a pick (List id or ref) names the stored ref, held as a ref or a bare id. */
function sameRef(value: unknown, stored: unknown): boolean {
  return !!refId(value) && refId(value) === refId(stored);
}

/** A List ref's id, held as a ref or a bare id string. */
function refId(ref: unknown): string | undefined {
  return typeof ref === 'string' ? ref : (ref as DemiListRef | null | undefined)?._id;
}

/** The ref DEMI stores for a new List pick. The form holds the List id; an id the Lists lack goes with no name. */
function listRef(value: string | DemiListRef, lists: List[]): WriteListRef {
  const id = typeof value === 'string' ? value : value._id;
  const row = lists.find(item => item.id === id);
  if (row) {
    return { _id: row.id, name: row.name, type: row.type, legislation: row.legislation, ...(row.item && { item: row.item }) };
  }
  return typeof value === 'string' ? { _id: id, name: null } : value;
}

/** `[lon, lat]` as the GeoJSON point DEMI stores; undefined when either is blank. */
function point(centroid: unknown[] | undefined): { type: 'Point'; coordinates: number[] } | undefined {
  const coordinates = (centroid ?? []).map(value => (value === '' || value == null ? NaN : Number(value)));
  return coordinates.length === 2 && coordinates.every(Number.isFinite) ? { type: 'Point', coordinates } : undefined;
}
