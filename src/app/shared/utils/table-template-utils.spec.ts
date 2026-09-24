import { nextSortBy } from './table-template-utils';

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

  it('flips a multi-key column sort on its first key', () => {
    expect(nextSortBy('+lastName,+firstName', 'lastName,+firstName')).toBe('-lastName,+firstName');
  });

  it('flips a descending multi-key column sort back to ascending', () => {
    expect(nextSortBy('-lastName,+firstName', 'lastName,+firstName')).toBe('+lastName,+firstName');
  });
});
