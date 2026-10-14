import { User, contactExportRow, nativeSort, tableSort } from './user';

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
