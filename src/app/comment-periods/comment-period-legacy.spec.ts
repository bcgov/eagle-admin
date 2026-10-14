import { toEagleSaveBody, toLegacyCommentPeriod } from './comment-period-legacy';
import { nativeCommentPeriod } from '../models/demi/comment-period.fixture';

const STAFF = ['sysadmin', 'offline_access'];

describe('toLegacyCommentPeriod', () => {
  it('keys the period on its Eagle id and keeps the DEMI id beside it', () => {
    const period = toLegacyCommentPeriod(nativeCommentPeriod({ id: 'engage-7', eagleId: '598b6eb61ecbc9001dfeba56' }), STAFF);
    expect(period._id).toBe('598b6eb61ecbc9001dfeba56');
    expect(period.demiId).toBe('engage-7');
  });

  it('routes under the Eagle project id', () => {
    expect(toLegacyCommentPeriod(nativeCommentPeriod(), STAFF).project).toBe('59679ade3acbf9001de7ea8b');
  });

  it('routes a notification-parented period under its notification id', () => {
    const row = nativeCommentPeriod({ projectId: '5f0a6c1b2e3f4a5b6c7d8e01', projectEagleId: undefined });
    expect(toLegacyCommentPeriod(row, STAFF).project).toBe('5f0a6c1b2e3f4a5b6c7d8e01');
  });

  it('fills userCan from the token roles, not the row', () => {
    expect(toLegacyCommentPeriod(nativeCommentPeriod({ userCan: 'stored' }), STAFF).userCan).toBe('sysadmin,offline_access');
  });

  it('lets staff edit an Eagle period', () => {
    expect(toLegacyCommentPeriod(nativeCommentPeriod(), STAFF).readOnly).toBeFalse();
  });

  it('is read-only for a token without the staff role', () => {
    expect(toLegacyCommentPeriod(nativeCommentPeriod(), ['offline_access']).readOnly).toBeTrue();
  });

  it('is read-only when ENGAGE owns the period, even with an Eagle id', () => {
    expect(toLegacyCommentPeriod(nativeCommentPeriod({ sourceSystem: 'engage' }), STAFF).readOnly).toBeTrue();
  });

  it('is read-only when the period has no Eagle id, but still routes on its DEMI id', () => {
    const period = toLegacyCommentPeriod(nativeCommentPeriod({ id: 'engage-7', eagleId: undefined }), STAFF);
    expect(period.readOnly).toBeTrue();
    expect(period._id).toBe('engage-7');
  });

  it('is read-only when the row was read without staff fields', () => {
    const { milestone, ...row } = nativeCommentPeriod();
    void milestone;
    expect(toLegacyCommentPeriod(row, STAFF).readOnly).toBeTrue();
  });

  it('keeps token roles and screen fields out of the eagle-api save body', () => {
    const body = toEagleSaveBody(toLegacyCommentPeriod(nativeCommentPeriod(), STAFF));
    expect(Object.keys(body)).not.toContain('userCan');
    expect(Object.keys(body)).not.toContain('demiId');
    expect(Object.keys(body)).not.toContain('readOnly');
    expect(body._id).toBe('598b6eb61ecbc9001dfeba55');
  });

  it('works out the status the screens show from the native dates', () => {
    const period = toLegacyCommentPeriod(nativeCommentPeriod({ dateStarted: '2020-01-01', dateCompleted: '2020-02-01' }));
    expect(period.commentPeriodStatus).toBe('Closed');
  });
});
