import { UpdateImage } from '../recentActivity';

/**
 * A native DEMI update row (`GET <DEMI_API_PATH>/updates`). `id` is the Eagle id.
 * `projectId` is the EAGLE id of the parent project or project notification, as Eagle stores it;
 * `projectName` and `projectEagleId` are joined from the parent project when the caller may read it.
 * Image and attachment fields hold Eagle document ids.
 */
export interface DemiUpdate {
  id: string;
  eagleId?: string | null;
  projectId: string | null;
  projectEagleId?: string;
  projectName?: string;
  headline: string;
  content: string;
  type: string;
  pinned: boolean;
  dateAdded: string;
  dateUpdated: string | null;
  active: boolean;
  notificationName: string | null;
  contentUrl: string | null;
  documentUrl: string | null;
  pcp: string | null;
  projectNotification: string | null;
  category: string | null;
  subject: string | null;
  shortHeadline: string | null;
  summary: string | null;
  featuredImage: UpdateImage | null;
  images: UpdateImage[];
  attachments: string[];
  regions: string[];
  location: string | null;
  engagementUrl: string | null;
  status: 'draft' | 'published' | 'archived' | null;
  publishDate: string | null;
  isPublished?: boolean;
}

/** Fields DEMI sorts `/updates` by. */
const UPDATE_SORT_KEYS = ['dateAdded', 'dateUpdated', 'publishDate'];

/** Table sort (`-dateAdded`, `+publishDate`) as a native updates `sort`; keys DEMI cannot sort by are dropped. */
export function nativeUpdateSort(sortBy: string | null | undefined): string | undefined {
  const match = /^([+-]?)(\w+)$/.exec(sortBy ?? '');
  return match && UPDATE_SORT_KEYS.includes(match[2]) ? `${match[1] === '-' ? '-' : ''}${match[2]}` : undefined;
}

/** The Eagle id of the parent project or project notification, or null for an update with none. */
export function updateParentId(row: Pick<DemiUpdate, 'projectId' | 'projectEagleId'>): string | null {
  return row.projectEagleId ?? row.projectId ?? null;
}
