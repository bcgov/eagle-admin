import { eagleWriteId, eagleWriteProjectId } from './document-write';

describe('eagleWriteId', () => {
  it('keeps the _id of a legacy row', () => {
    expect(eagleWriteId({ _id: '5886936ba4acd4014b81ef3c' })).toBe('5886936ba4acd4014b81ef3c');
  });

  it('uses the eagleId of a native row whose own id is a DEMI uuid', () => {
    expect(eagleWriteId({ eagleId: '5886936ba4acd4014b81ef3c' })).toBe('5886936ba4acd4014b81ef3c');
  });

  it('prefers the legacy _id when a row carries both ids', () => {
    expect(eagleWriteId({ _id: 'legacy', eagleId: 'native' })).toBe('legacy');
  });

  it('treats an empty _id as absent', () => {
    expect(eagleWriteId({ _id: '', eagleId: 'native' })).toBe('native');
  });

  it('answers null for a DEMI-only row', () => {
    expect(eagleWriteId({ eagleId: null })).toBeNull();
  });
});

describe('eagleWriteProjectId', () => {
  it('keeps the project of a legacy row', () => {
    expect(eagleWriteProjectId({ project: '5885109faaecd9001b81314c' })).toBe('5885109faaecd9001b81314c');
  });

  it('uses projectEagleId of a native row', () => {
    expect(eagleWriteProjectId({ projectEagleId: '5885109faaecd9001b81314c' })).toBe('5885109faaecd9001b81314c');
  });

  it('prefers the legacy project when a row carries both', () => {
    expect(eagleWriteProjectId({ project: 'legacy', projectEagleId: 'native' })).toBe('legacy');
  });

  it('treats an empty project as absent', () => {
    expect(eagleWriteProjectId({ project: '', projectEagleId: 'native' })).toBe('native');
  });

  it('answers null when the row names no Eagle project', () => {
    expect(eagleWriteProjectId({})).toBeNull();
  });
});
