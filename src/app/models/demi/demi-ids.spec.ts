import { isEagleId } from './demi-ids';

describe('isEagleId', () => {
  it('accepts a 24-hex Mongo ObjectId in lower case', () => {
    expect(isEagleId('5c7d5c4b9ef1d1001a1b2c3d')).toBeTrue();
  });

  it('accepts a 24-hex Mongo ObjectId in upper case', () => {
    expect(isEagleId('5C7D5C4B9EF1D1001A1B2C3D')).toBeTrue();
  });

  it('rejects a numeric Track project id', () => {
    expect(isEagleId('1234')).toBeFalse();
  });

  it('rejects a DEMI uuid', () => {
    expect(isEagleId('3f2b8a1e-6c1d-4b8e-9f3a-2d7c5e0a1b4c')).toBeFalse();
  });

  it('rejects 24 characters that are not all hex', () => {
    expect(isEagleId('5c7d5c4b9ef1d1001a1b2c3z')).toBeFalse();
  });

  it('rejects an Eagle id with a trailing character', () => {
    expect(isEagleId('5c7d5c4b9ef1d1001a1b2c3d0')).toBeFalse();
  });

  it('rejects null', () => {
    expect(isEagleId(null)).toBeFalse();
  });
});
