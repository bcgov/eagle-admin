/** A native DEMI notification row. `id` is the Eagle `_id`; no project axis, `associatedProjectId` is a loose Eagle project id. */
export interface DemiNotification {
  id: string;
  eagleId?: string;
  sourceSystem?: string;
  name: string | null;
  type: string | null;
  subType: string | null;
  proponent: string | null;
  nature: string | null;
  region: string | null;
  location: string | null;
  decision: string | null;
  decisionDate: string | null;
  notificationReceivedDate: string | null;
  trigger: string | null;
  description: string | null;
  centroid: string[];
  notificationThresholdValue: number | null;
  notificationThresholdUnits: string | null;
  associatedProjectId: string | null;
  associatedProjectName: string | null;
  pcp: string;
  isMet: boolean;
  metURL: string;
  dateStarted: string | null;
  dateCompleted: string | null;
  isPublished: boolean;
  /** Staff-side ACL array; DEMI leaves it out for a request with no staff credential. */
  read?: string[];
}

/** Eagle-shaped notification: native fields under the Eagle `_id`, with `read` always an array. */
export type LegacyNotification = Omit<DemiNotification, 'id' | 'eagleId' | 'sourceSystem' | 'isPublished' | 'read'> & {
  _id: string;
  read: string[];
};

/** Sort fields DEMI accepts on `/notifications`. */
export const NOTIFICATION_SORTS: readonly string[] = ['name', 'notificationReceivedDate'];

/** DEMI sort for a table `sortBy` (`+name`, `-name`, ...); undefined for a field DEMI cannot sort, so DEMI's default applies. */
export function notificationSort(sortBy: string | null | undefined): string | undefined {
  const field = (sortBy ?? '').replace(/^[+-]/, '');
  if (!NOTIFICATION_SORTS.includes(field)) {
    return undefined;
  }
  return sortBy!.startsWith('-') ? `-${field}` : field;
}

/** Eagle shape for screens and writes. Keeps pcp, isMet, metURL and period dates: eagle-api's PUT blanks any it is not sent. */
export function legacyNotification(row: DemiNotification): LegacyNotification {
  const { id, eagleId, isPublished, read, ...fields } = row;
  delete fields.sourceSystem;
  return {
    ...fields,
    _id: eagleId ?? id,
    read: read ?? (isPublished ? ['public'] : [])
  };
}
