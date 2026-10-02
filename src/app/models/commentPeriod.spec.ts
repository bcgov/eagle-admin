import { CommentPeriod } from './commentPeriod';

describe('CommentPeriod', () => {
  describe('isPublished', () => {
    it('stays unpublished when read is public but isPublished is null', () => {
      const period = new CommentPeriod({ read: ['public', 'staff'], isPublished: null });

      expect(period.isPublished).not.toBe(true);
    });

    it('is published when isPublished is true and read is not public', () => {
      const period = new CommentPeriod({ read: ['staff', 'sysadmin'], isPublished: true });

      expect(period.isPublished).toBe(true);
    });
  });
});
