import { nativeSort, nextSortBy, tableSort } from './table-template-utils';

describe('nextSortBy', () => {
  it('flips an ascending sort on the same column to descending', () => {
    expect(nextSortBy('+name', 'name')).toBe('-name');
  });

  it('flips a descending sort on the same column back to ascending', () => {
    expect(nextSortBy('-name', 'name')).toBe('+name');
  });

  it('starts a new column ascending when the old column was ascending', () => {
    expect(nextSortBy('+name', 'dateAdded')).toBe('+dateAdded');
  });

  it('starts a new column ascending when the old column was descending', () => {
    expect(nextSortBy('-name', 'dateAdded')).toBe('+dateAdded');
  });

  it('starts ascending when there is no current sort', () => {
    expect(nextSortBy(null, 'name')).toBe('+name');
  });

  it('starts ascending when the current sort is empty', () => {
    expect(nextSortBy('', 'name')).toBe('+name');
  });
});

describe('nativeSort', () => {
  it('keeps a descending sort on the allowed field', () => {
    expect(nativeSort('-displayName', 'displayName')).toBe('-displayName');
  });

  it('sends an ascending table sort without the plus sign', () => {
    expect(nativeSort('+displayName', 'displayName')).toBe('displayName');
  });

  it('falls back to the allowed field for an old multi-column sort', () => {
    expect(nativeSort('-lastName,+firstName', 'displayName')).toBe('displayName');
  });

  it('falls back to the allowed field when there is no sort', () => {
    expect(nativeSort(undefined, 'name')).toBe('name');
  });
});

describe('tableSort', () => {
  it('adds the plus sign the table header expects', () => {
    expect(tableSort('displayName')).toBe('+displayName');
  });

  it('keeps a descending sort as is', () => {
    expect(tableSort('-name')).toBe('-name');
  });
});
