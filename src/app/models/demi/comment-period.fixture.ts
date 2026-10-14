import { DemiCommentPeriod } from './comment-period';

/** A staff-read DEMI comment period mirrored from Eagle: its `id` is the Eagle id. */
export function nativeCommentPeriod(overrides: Partial<DemiCommentPeriod> = {}): DemiCommentPeriod {
  return {
    id: '598b6eb61ecbc9001dfeba55', eagleId: '598b6eb61ecbc9001dfeba55', projectId: '207',
    projectEagleId: '59679ade3acbf9001de7ea8b', projectName: 'Mine', sourceSystem: 'eagle',
    dateStarted: '2026-01-01T00:00:00Z', dateCompleted: '2026-02-01T00:00:00Z', dateAdded: null,
    isMet: false, metURL: '', informationLabel: '', instructions: 'Comment here', additionalText: '', commentTip: '',
    openHouses: [], relatedDocuments: [], milestone: '5c0a6c1b2e3f4a5b6c7d8e00', isPublished: true,
    ...overrides
  };
}
