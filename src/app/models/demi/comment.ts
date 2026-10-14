import { DemiEaoStatus } from './comment-period';

/**
 * A native DEMI comment row (`GET <DEMI_API_PATH>/comments`). Fields hidden from the caller are left out, including
 * an unattributed `author` for anyone but staff. `id` is the Eagle id for comments mirrored from Eagle.
 */
export interface DemiComment {
  id: string;
  eagleId?: string;
  /** DEMI id of the comment period. */
  periodId: string;
  /** DEMI project id, or the notification id when a project notification parents the period. */
  projectId: string;
  /** Sent only when the caller may read the project. */
  projectEagleId?: string;
  projectName?: string;
  sourceSystem?: string;

  author?: string | null;
  comment: string | null;
  commentId: number | null;
  dateAdded: string | null;
  dateUpdated: string | null;
  location: string | null;
  isAnonymous: boolean;
  submittedCAC: boolean;
  /** Eagle document ids. */
  documents: string[];
  eaoStatus: DemiEaoStatus | null;
  isPublished: boolean;

  // Staff fields.
  datePosted?: string | null;
  eaoNotes?: string | null;
  proponentNotes?: string | null;
  proponentStatus?: string | null;
  publishedNotes?: string | null;
  rejectedNotes?: string | null;
  rejectedReason?: string | null;
  valuedComponents?: string[];
}

/** Comment list filters DEMI accepts besides the period. */
export interface DemiCommentQuery {
  page?: number;
  pageSize?: number;
  /** `dateAdded`, `-` prefix for descending. DEMI defaults to `commentId` ascending. */
  sort?: string;
  /** Any of these statuses. */
  eaoStatus?: DemiEaoStatus[];
  /** Matched in the comment text only. */
  q?: string;
}

/** The lowest-numbered pending comment other than the one on screen, and how many others are pending. */
export interface NextPendingComment {
  nextId: string | null;
  pendingCount: number;
}
