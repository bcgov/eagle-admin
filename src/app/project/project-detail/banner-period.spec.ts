import { BannerPeriodRow, bannerPeriod } from './banner-period';

describe('bannerPeriod', () => {
  const now = new Date('2026-10-14T12:00:00Z');
  const period = (overrides: Partial<BannerPeriodRow>): BannerPeriodRow => ({
    id: 'cp-1',
    isPublished: true,
    dateStarted: '2026-10-10T00:00:00Z',
    dateCompleted: '2026-11-10T00:00:00Z',
    ...overrides
  });

  it('picks an open published period, keyed on its id', () => {
    expect(bannerPeriod([period({})], now)._id).toBe('cp-1');
  });

  it('picks a period that starts within the next week', () => {
    expect(bannerPeriod([period({ dateStarted: '2026-10-20T00:00:00Z' })], now)).not.toBeNull();
  });

  it('picks a period that closed within the last week', () => {
    expect(bannerPeriod([period({ dateStarted: '2026-09-01T00:00:00Z', dateCompleted: '2026-10-08T00:00:00Z' })], now)).not.toBeNull();
  });

  it('skips a period that starts more than a week out', () => {
    expect(bannerPeriod([period({ dateStarted: '2026-10-22T00:00:00Z' })], now)).toBeNull();
  });

  it('skips a period that closed more than a week ago', () => {
    expect(bannerPeriod([period({ dateStarted: '2026-09-01T00:00:00Z', dateCompleted: '2026-10-06T00:00:00Z' })], now)).toBeNull();
  });

  it('skips an unpublished period', () => {
    expect(bannerPeriod([period({ isPublished: false })], now)).toBeNull();
  });

  it('takes the first match in the order given', () => {
    expect(bannerPeriod([period({ id: 'newer' }), period({ id: 'older' })], now)._id).toBe('newer');
  });
});
