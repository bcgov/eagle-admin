/** A DEMI project contact group (`GET <DEMI_API_PATH>/groups`). `id` is the Eagle Group `_id` for a mirrored group, or a UUID for one made in DEMI. */
export interface Group {
  id: string;
  /** DEMI (Track) project id, not the Eagle one; `projectEagleId` carries that. */
  projectId: string;
  projectEagleId?: string;
  projectName?: string;
  name: string;
  /** DEMI user ids, as in `User.id`. */
  members: string[];
  /** Set by the admin tables when a row is ticked; never sent by DEMI. */
  checkbox?: boolean;
}
