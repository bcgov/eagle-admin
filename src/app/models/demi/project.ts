/** A pinned organization as DEMI stores it on the project row. */
export interface DemiPin {
  _id: string;
  name: string;
  province?: string;
}

/** A List lookup stored on the project row, e.g. `eacDecision`, `currentPhaseName`. */
export interface DemiListRef {
  _id: string;
  name: string;
  type?: string;
  legislation?: number;
}

/**
 * A native DEMI project row (`GET <DEMI_API_PATH>/projects`). `id` is the Track project id;
 * `eagleId` is the Eagle project id and is absent on Track-only projects.
 * Fields not listed keep their Eagle names.
 */
export interface DemiProject {
  id: string;
  eagleId?: string | null;
  trackProjectId?: number;
  name: string;
  projectType?: string;
  projectSubType?: string;
  proponentId?: string | null;
  proponentName?: string | null;
  region?: string;
  /** Eagle `status`. */
  projectState?: string;
  /** Eagle `location`. */
  address?: string;
  build?: string;
  centroid?: { type: string; coordinates: number[] } | null;
  eacDecision?: DemiListRef;
  currentPhaseName?: DemiListRef;
  CEAAInvolvement?: DemiListRef;
  decisionDate?: string;
  legislationYear?: number;
  isPublished?: boolean;
  pins?: DemiPin[];
  [field: string]: unknown;
}
