import { updateParentId } from './update';

describe('DEMI update helpers', () => {
  it('prefers the joined project Eagle id, then the stored parent id', () => {
    expect(updateParentId({ projectId: 'p', projectEagleId: 'e' })).toBe('e');
    expect(updateParentId({ projectId: 'p' })).toBe('p');
    expect(updateParentId({ projectId: null })).toBeNull();
  });
});
