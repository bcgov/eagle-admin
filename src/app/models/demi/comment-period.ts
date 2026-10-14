import { WriteIds, eagleWriteId } from './demi-ids';

/**
 * A native DEMI comment period row (`GET <DEMI_API_PATH>/comment-periods`). Fields hidden from the caller are left out.
 * `id` is the Eagle id for periods mirrored from Eagle; a period ENGAGE created has its own id and carries `eagleId`
 * once it reaches Eagle.
 */
export interface DemiCommentPeriod {
  id: string;
  eagleId?: string;
  /** DEMI project id, or the notification id when a project notification is the parent. */
  projectId: string;
  /** Sent only when the caller may read the project. */
  projectEagleId?: string;
  projectName?: string;
  sourceSystem?: 'eagle' | 'engage';

  dateStarted: string | null;
  dateCompleted: string | null;
  dateAdded: string | null;
  dateUpdated?: string | null;
  dateStartedEst?: string | null;
  dateCompletedEst?: string | null;
  isMet: boolean;
  metURL: string;
  metURLAdmin?: string;
  metBannerImageUrl?: string;
  informationLabel: string;
  instructions: string;
  additionalText: string;
  commentTip: string;
  openHouses: unknown[];
  relatedDocuments: string[];
  isPublished: boolean;

  // Staff fields.
  milestone?: string | null;
  ceaaAdditionalText?: string;
  ceaaInformationLabel?: string;
  ceaaRelatedDocuments?: string;
  classificationRoles?: string[];
  classifiedPercent?: number | null;
  commenterRoles?: string[];
  commentIdCount?: number | null;
  downloadRoles?: string[];
  isClassified?: boolean | null;
  isResolved?: boolean | null;
  isVetted?: string;
  periodType?: string;
  phase?: string;
  phaseName?: string;
  publishedPercent?: number | null;
  rangeOption?: string;
  rangeType?: string;
  resolvedPercent?: number | null;
  userCan?: string;
  vettedPercent?: number | null;
  vettingRoles?: string[];
}

export type DemiEaoStatus = 'Pending' | 'Published' | 'Rejected' | 'Deferred';

/** `GET <DEMI_API_PATH>/comment-periods/:id/summary`. Counts only comments the caller may read. */
export interface DemiCommentPeriodSummary {
  id: string;
  total: number;
  eaoStatus: Record<DemiEaoStatus, number>;
}

/** Comment period list filters DEMI accepts besides paging. */
export interface DemiCommentPeriodQuery {
  page?: number;
  pageSize?: number;
  /** `dateStarted` or `dateCompleted`, `-` prefix for descending. DEMI defaults to `-dateStarted`. */
  sort?: string;
  status?: Array<'open' | 'upcoming' | 'closed'>;
}

/** Fields only DEMI rows carry; eagle-api has no use for them. */
const DEMI_ONLY_FIELDS = [
  'id', 'eagleId', 'periodId', 'projectId', 'projectEagleId', 'projectName', 'sourceSystem', 'read', 'sources', 'isDeleted'
];

/** {@link eagleWriteId} for a comment or period write. ENGAGE rows and rows with no Eagle id are read-only here: both throw. */
export function requireEagleWriteId(row: WriteIds & { sourceSystem?: string }, kind: string): string {
  if (!('_id' in row) && row.sourceSystem === 'engage') {
    throw new Error(`This ${kind} is managed in ENGAGE and cannot be changed here.`);
  }
  const id = eagleWriteId(row);
  if (!id) {
    throw new Error(notInEagle(kind));
  }
  return id;
}

/**
 * eagle-api write body for a comment or comment period. A body with `_id` is legacy and goes out unchanged; a native
 * row gets its Eagle id and Eagle parent reference, minus DEMI-only fields. eagle-api reads the parent only on
 * create, so only a create without one throws; so does an update of a row with no Eagle id.
 */
export function toEagleWriteBody(row: object, kind: string, parent: Record<string, string | null>, isNew: boolean): any {
  if ('_id' in row) {
    return row;
  }
  const parentKnown = Object.values(parent).every(Boolean);
  if (isNew && !parentKnown) {
    throw new Error(notInEagle(kind));
  }
  const _id = isNew ? null : requireEagleWriteId(row, kind);
  const body: any = { ...row, ...(parentKnown ? parent : {}), _id };
  DEMI_ONLY_FIELDS.forEach(field => delete body[field]);
  return body;
}

function notInEagle(kind: string): string {
  return `This ${kind} is not in Eagle yet and cannot be changed here.`;
}
