/** A native DEMI `List` lookup row (`GET <DEMI_API_PATH>/lists`). `id` is the Eagle List `_id`. */
export interface List {
  id: string;
  name: string;
  /** Lookup group, e.g. `doctype`, `label`, `projectPhase`. */
  type: string;
  /** Legislation year, or 0 for rows that apply to every year. */
  legislation: number;
  listOrder: number | null;
  item?: string;
}
