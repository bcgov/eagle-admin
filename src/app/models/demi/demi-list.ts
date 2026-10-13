/** One page of a DEMI native list. `total` is set only when the request asked for `count=true`. */
export interface DemiList<T> {
  rows: T[];
  total?: number;
}

/** A filter value. An array sends the field once per value, which DEMI reads as OR. */
export type DemiFilterValue = string | number | boolean | Array<string | number>;

/**
 * Query for `GET <DEMI_API_PATH>/<kind>`. Filters use DEMI native field names.
 * `sort` is one field, with a `-` prefix for descending; allowed fields differ per kind.
 */
export interface DemiListParams {
  page?: number;
  pageSize?: number;
  count?: boolean;
  sort?: string;
  q?: string;
  ids?: string[];
  filters?: Record<string, DemiFilterValue | null | undefined>;
}
