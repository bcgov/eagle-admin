import { CommentPeriod } from '../models/commentPeriod';
import { DemiCommentPeriod } from '../models/demi/comment-period';
import { eagleWriteId } from '../models/demi/demi-ids';

/** The realm role the admin app signs staff in with (see `KeycloakService.isAuthorized`). */
export const STAFF_ROLE = 'sysadmin';

/**
 * A legacy `CommentPeriod` built from a DEMI row. `_id` is the Eagle id (or the DEMI id when there is none, so routes
 * still resolve), `project` the Eagle project or notification id the routes use, `demiId` the DEMI id.
 */
export type LegacyCommentPeriod = CommentPeriod & { demiId: string; readOnly: boolean };

/**
 * Builds the legacy `CommentPeriod` the period screens read; `userCan` is the caller's token roles (DEMI has no per-caller
 * answer). Read-only when ENGAGE owns it, it lacks an Eagle id or staff fields, or the caller lacks the staff role.
 */
export function toLegacyCommentPeriod(row: DemiCommentPeriod, roles: string[] = []): LegacyCommentPeriod {
  const { id, eagleId, projectId, projectEagleId, ...rest } = row;
  const writeId = eagleWriteId({ id, eagleId });
  const period = new CommentPeriod({
    ...rest,
    _id: writeId ?? id,
    project: projectEagleId ?? projectId,
    userCan: roles.join(',')
  });
  const readOnly = row.sourceSystem === 'engage' || !writeId || !('milestone' in row) || !roles.includes(STAFF_ROLE);
  return Object.assign(period, { demiId: id, readOnly });
}

/** The eagle-api save body: drops the screen-only fields, and `userCan`, which holds token roles here. */
export function toEagleSaveBody(period: CommentPeriod): CommentPeriod {
  const body: Partial<LegacyCommentPeriod> = { ...period };
  delete body.demiId;
  delete body.readOnly;
  delete body.userCan;
  return body as CommentPeriod;
}
