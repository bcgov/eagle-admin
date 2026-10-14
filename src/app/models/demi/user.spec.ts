import { User, contactExportRow } from './user';

describe('contactExportRow', () => {
  it('joins both address lines with a space', () => {
    const row = contactExportRow({ address1: '1 Main St', address2: 'Suite 2' } as User);
    expect(row.address).toBe('1 Main St Suite 2');
  });

  it('leaves no trailing space when there is no second line', () => {
    const row = contactExportRow({ address1: '1 Main St', address2: '' } as User);
    expect(row.address).toBe('1 Main St');
  });
});
