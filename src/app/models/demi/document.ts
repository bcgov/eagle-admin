import { DemiListParams } from './demi-list';

/**
 * A native DEMI document row (`GET <DEMI_API_PATH>/documents`). Fields the caller may not see are left out.
 * `id` is the Eagle id for mirrored rows and a UUID for DEMI-created ones; `projectId` is the DEMI project id.
 */
export interface DemiDocument {
  id: string;
  projectId: string;
  eagleId?: string | null;
  /** Set when the caller may read the parent project. */
  projectEagleId?: string | null;
  projectName?: string;
  sourceSystem?: string;
  displayName: string;
  documentFileName?: string;
  description?: string;
  fileExt?: string;
  /** Bytes; a numeric string on many mirrored rows. */
  fileSize?: number | string | null;
  mimeType?: string;
  type?: string;
  typeId?: string;
  milestone?: string;
  milestoneId?: string;
  projectPhase?: string;
  projectPhaseId?: string;
  documentAuthor?: string;
  documentAuthorType?: string;
  documentAuthorTypeId?: string;
  documentSource?: string;
  datePosted?: string | null;
  dateUploaded?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
  /** Staff-set order on the application sort screen. */
  sortOrder?: number | null;
  eaoStatus?: string;
  legislation?: number | null;
  region?: string;
  updatedAt?: string;
}

/** Filters `GET /documents` accepts. Id filters and `legislation` take an array, sent once per value (OR). */
export type DemiDocumentFilters = {
  /** DEMI project id. */
  project?: string;
  typeId?: string | string[];
  milestoneId?: string | string[];
  projectPhaseId?: string | string[];
  documentAuthorTypeId?: string | string[];
  /** `PROJECT` leaves comment attachments out. */
  documentSource?: string | string[];
  isFeatured?: boolean;
  legislation?: number | number[];
  /** ISO date, inclusive. */
  datePostedStart?: string;
  datePostedEnd?: string;
};

/** List query for documents. Sortable fields: `datePosted`, `displayName`, `sortOrder`. */
export type DemiDocumentListParams = Omit<DemiListParams, 'filters' | 'ids'> & { filters?: DemiDocumentFilters };

/** `GET /documents/:id/download` answer. `url` is presigned and short-lived. */
export interface DemiDocumentDownload {
  url: string;
  expiresIn: number;
  fileName: string;
  displayName: string | null;
}
