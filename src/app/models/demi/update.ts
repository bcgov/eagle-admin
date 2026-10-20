import { UpdateImage } from '../recentActivity';

/**
 * Native DEMI update row (`GET <DEMI_API_PATH>/updates`); `id`, `projectId` (parent project or notification) and image and
 * attachment ids are Eagle ids. `projectName`, `projectEagleId` join from the parent project when the caller may read it.
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
export const UPDATE_SORT_KEYS = ['dateAdded', 'dateUpdated', 'publishDate', 'headline', 'type', 'pinned', 'status'];

/** The Eagle id of the parent project or project notification, or null for an update with none. */
export function updateParentId(row: Pick<DemiUpdate, 'projectId' | 'projectEagleId'>): string | null {
  return row.projectEagleId ?? row.projectId ?? null;
}
