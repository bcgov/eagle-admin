import { CommentPeriod } from 'src/app/models/commentPeriod';

/** The native comment period fields the banner window needs. */
export interface BannerPeriodRow {
  id: string;
  isPublished?: boolean;
  dateStarted?: string;
  dateCompleted?: string;
}

const WINDOW_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The published period the project banner shows: the first one that overlaps the week either side
 * of `now`, the same window eagle-api applied with `cpStart`/`cpEnd`.
 */
export function bannerPeriod(rows: BannerPeriodRow[], now = new Date()): CommentPeriod | null {
  const windowStart = now.getTime() - WINDOW_DAYS * DAY_MS;
  const windowEnd = now.getTime() + WINDOW_DAYS * DAY_MS;
  const row = rows.find(cp =>
    cp.isPublished === true && !!cp.dateStarted && !!cp.dateCompleted &&
    Date.parse(cp.dateStarted) <= windowEnd && Date.parse(cp.dateCompleted) >= windowStart
  );
  return row ? new CommentPeriod({ ...row, _id: row.id }) : null;
}
