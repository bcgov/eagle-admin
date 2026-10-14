import { DemiPin } from 'src/app/models/demi/project';

export interface PinsPage {
  rows: DemiPin[];
  total: number;
}

/**
 * One page of the pins stored on a DEMI project row. DEMI returns every pin with the row, so
 * sorting and paging happen here. `sortBy` is `+field` or `-field`; `page` starts at 1.
 */
export function pinsPage(pins: DemiPin[] | null | undefined, sortBy: string, page: number, pageSize: number): PinsPage {
  const all = [...(pins ?? [])];
  const field = (sortBy || '+name').replace(/^[+-]/, '') as keyof DemiPin;
  const direction = sortBy?.startsWith('-') ? -1 : 1;
  all.sort((a, b) => direction * String(a[field] ?? '').localeCompare(String(b[field] ?? ''), undefined, { sensitivity: 'base' }));
  const start = (Math.max(page, 1) - 1) * pageSize;
  return { rows: all.slice(start, start + pageSize), total: all.length };
}
