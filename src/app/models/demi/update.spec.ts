import { nativeUpdateSort, updateParentId } from './update';

describe('DEMI update helpers', () => {
  it('turns a table sort into a native sort, dropping keys DEMI cannot sort by', () => {
    expect(nativeUpdateSort('-dateAdded')).toBe('-dateAdded');
    expect(nativeUpdateSort('+dateAdded')).toBe('dateAdded');
    expect(nativeUpdateSort('publishDate')).toBe('publishDate');
    expect(nativeUpdateSort('+headline')).toBeUndefined();
    expect(nativeUpdateSort('-project.name')).toBeUndefined();
    expect(nativeUpdateSort('')).toBeUndefined();
    expect(nativeUpdateSort(null)).toBeUndefined();
  });

  it('prefers the joined project Eagle id, then the stored parent id', () => {
    expect(updateParentId({ projectId: 'p', projectEagleId: 'e' })).toBe('e');
    expect(updateParentId({ projectId: 'p' })).toBe('p');
    expect(updateParentId({ projectId: null })).toBeNull();
  });
});
