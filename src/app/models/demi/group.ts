/** A native DEMI project contact group (`GET <DEMI_API_PATH>/groups`). `id` is the Eagle Group `_id`. */
export interface Group {
  id: string;
  /** DEMI (Track) project id, not the Eagle one; `projectEagleId` carries that. */
  projectId: string;
  projectEagleId?: string;
  projectName?: string;
  name: string;
  /** Eagle User ids. */
  members: string[];
  /** Set by the admin tables when a row is ticked; never sent by DEMI. */
  checkbox?: boolean;
}
