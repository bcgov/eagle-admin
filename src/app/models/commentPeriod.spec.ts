import { CommentPeriod } from './commentPeriod';

describe('CommentPeriod', () => {
  describe('isPublished', () => {
    it('is published when read is public and isPublished was never stored', () => {
      const period = new CommentPeriod({ read: ['public', 'staff'], isPublished: null });

      expect(period.isPublished).toBe(true);
    });

    it('is unpublished when read is not public and isPublished was never stored', () => {
      const period = new CommentPeriod({ read: ['staff', 'sysadmin'] });

      expect(period.isPublished).toBe(false);
    });

    it('keeps a stored false even when read is public', () => {
      const period = new CommentPeriod({ read: ['public', 'staff'], isPublished: false });

      expect(period.isPublished).toBe(false);
    });

    it('is published when isPublished is true and read is not public', () => {
      const period = new CommentPeriod({ read: ['staff', 'sysadmin'], isPublished: true });

      expect(period.isPublished).toBe(true);
    });
  });
});
