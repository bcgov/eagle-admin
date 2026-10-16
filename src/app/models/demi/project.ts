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

/** A project list multi-select: the URL holds each picked item's `by`; DEMI filter `api` gets each item's `apiKey`. */
export interface ProjectFilter {
  by: string;
  api: string;
  apiKey: string;
}

/**
 * Project list filters by URL param name, for the project list and search pages.
 * DEMI region List rows have no code, and DEMI filters proponents by name.
 */
export const PROJECT_FILTERS: Record<'region' | 'CEAAInvolvement' | 'proponent' | 'eacDecision' | 'type' | 'projectPhase', ProjectFilter> = {
  region: { by: 'name', api: 'region', apiKey: 'name' },
  CEAAInvolvement: { by: 'id', api: 'CEAAInvolvement', apiKey: 'id' },
  proponent: { by: 'id', api: 'proponentName', apiKey: 'name' },
  eacDecision: { by: 'id', api: 'eacDecision', apiKey: 'id' },
  type: { by: 'name', api: 'projectType', apiKey: 'name' },
  projectPhase: { by: 'id', api: 'currentPhaseName', apiKey: 'id' }
};

/** Fields DEMI sorts `/projects` by; the project list column values use the same names. */
export const PROJECT_SORT_KEYS = ['name', 'proponentName', 'projectType', 'region', 'currentPhaseName.name', 'eacDecisionSort'];

/** Project list comment period filter: the URL holds each picked `code`, sent to DEMI as repeated `pcp`. */
export const PCP_FILTER: ProjectFilter = { by: 'code', api: 'pcp', apiKey: 'code' };
