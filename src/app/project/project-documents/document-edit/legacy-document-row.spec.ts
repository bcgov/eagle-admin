import { isSelectableDocument, legacyDocumentRow, nativeDocumentSort } from './legacy-document-row';

describe('isSelectableDocument', () => {
  it('accepts a row of the screen\'s source with an Eagle id', () => {
    expect(isSelectableDocument({ _id: 'e1', documentSource: 'PROJECT' }, 'PROJECT')).toBeTrue();
  });

  it('refuses a comment attachment on a project screen', () => {
    expect(isSelectableDocument({ _id: 'e1', documentSource: 'COMMENT' }, 'PROJECT')).toBeFalse();
  });

  it('refuses a row with no Eagle id', () => {
    expect(isSelectableDocument({ _id: null, documentSource: 'PROJECT' }, 'PROJECT')).toBeFalse();
  });
});

describe('legacyDocumentRow', () => {
  it('returns a legacy row unchanged', () => {
    const legacy = { _id: 'e1', id: 'ignored', project: 'p1', type: 'type-1' };

    expect(legacyDocumentRow(legacy)).toBe(legacy);
  });

  it('maps a native row to Eagle ids and list ids', () => {
    const row = legacyDocumentRow({
      id: 'uuid', eagleId: 'e1', projectId: 'demi-p', projectEagleId: 'p1',
      type: 'Letter', typeId: 'type-1', milestoneId: 'm1', projectPhaseId: 'ph1', documentAuthorTypeId: 'a1'
    });

    expect(row._id).toBe('e1');
    expect(row.project).toBe('p1');
    expect(row.type).toBe('type-1');
    expect(row.milestone).toBe('m1');
    expect(row.projectPhase).toBe('ph1');
    expect(row.documentAuthorType).toBe('a1');
  });

  it('leaves _id null for a native row with no Eagle record', () => {
    expect(legacyDocumentRow({ id: 'uuid', projectId: 'demi-p' })._id).toBeNull();
  });
});

describe('nativeDocumentSort', () => {
  it('keeps the sort keys DEMI allows, without a + prefix', () => {
    expect(nativeDocumentSort('-datePosted')).toBe('-datePosted');
    expect(nativeDocumentSort('+displayName')).toBe('displayName');
    expect(nativeDocumentSort('-sortOrder')).toBe('-sortOrder');
  });

  it('drops keys DEMI cannot sort by', () => {
    expect(nativeDocumentSort('+type')).toBeUndefined();
    expect(nativeDocumentSort(null)).toBeUndefined();
  });
});
