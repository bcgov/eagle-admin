import { pinsPage } from './pins-page';

describe('pinsPage', () => {
  const pins = [
    { _id: 'o1', name: 'Tsawout', province: 'BC' },
    { _id: 'o2', name: 'alkali Lake', province: 'AB' },
    { _id: 'o3', name: 'Musqueam', province: 'BC' }
  ];
  const names = (sortBy: string, page = 1, pageSize = 10) => pinsPage(pins, sortBy, page, pageSize).rows.map(pin => pin.name);

  it('sorts by name A to Z, ignoring case', () => {
    expect(names('+name')).toEqual(['alkali Lake', 'Musqueam', 'Tsawout']);
  });

  it('sorts by name Z to A', () => {
    expect(names('-name')).toEqual(['Tsawout', 'Musqueam', 'alkali Lake']);
  });

  it('sorts by province', () => {
    expect(names('+province')[0]).toBe('alkali Lake');
  });

  it('sorts by name when no sort is given', () => {
    expect(names('')).toEqual(['alkali Lake', 'Musqueam', 'Tsawout']);
  });

  it('returns the requested page and the full count', () => {
    const page = pinsPage(pins, '+name', 2, 2);
    expect(page.rows.map(pin => pin.name)).toEqual(['Tsawout']);
    expect(page.total).toBe(3);
  });

  it('treats a missing pins list as empty', () => {
    expect(pinsPage(undefined, '+name', 1, 10)).toEqual({ rows: [], total: 0 });
  });

  it('leaves the input order alone', () => {
    pinsPage(pins, '-name', 1, 10);
    expect(pins[0].name).toBe('Tsawout');
  });
});
