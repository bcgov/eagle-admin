/**
 * Native DEMI comment period row (`GET <DEMI_API_PATH>/comment-periods`), minus fields hidden from the caller. `id` is
 * the Eagle id for periods mirrored from Eagle; ENGAGE and DEMI periods have their own id and get `eagleId` once in Eagle.
 */
export interface DemiCommentPeriod {
  id: string;
  eagleId?: string;
  /** DEMI project id, or the notification id when a project notification is the parent. */
  projectId: string;
  /** Sent only when the caller may read the project. */
  projectEagleId?: string;
  projectName?: string;
  sourceSystem?: 'eagle' | 'engage' | 'demi';

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
