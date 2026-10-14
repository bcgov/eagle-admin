import { eagleWriteProjectId } from './document-write';

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
