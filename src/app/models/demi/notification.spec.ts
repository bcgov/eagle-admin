import { DemiNotification, legacyNotification, notificationSort } from './notification';

const NATIVE: DemiNotification = {
  id: '6a3c4c034e547e4250daf03b',
  eagleId: '6a3c4c034e547e4250daf03b',
  sourceSystem: 'eagle',
  name: 'Lynn Valley Coal Mine PN',
  type: 'Mines',
  subType: 'Coal Mines',
  proponent: 'Lynn Valley People',
  nature: 'New Construction',
  region: 'Lower Mainland',
  location: 'Lynn Valley',
  decision: 'In Progress',
  decisionDate: null,
  notificationReceivedDate: '2026-06-24T07:00:00.000Z',
  trigger: 'Organic/Inorganic Chemicals',
  description: 'Test',
  centroid: ['49.3347', '-123.0407'],
  notificationThresholdValue: 75,
  notificationThresholdUnits: 'tonnes/year',
  associatedProjectId: '5885109faaecd9001b81314c',
  associatedProjectName: 'Lynn Valley Mine',
  pcp: 'open',
  isMet: true,
  metURL: 'https://engage.example/pcp',
  dateStarted: '2026-07-01T07:00:00.000Z',
  dateCompleted: null,
  isPublished: true
};

describe('legacyNotification', () => {
  it('keys the row on the Eagle id and drops the native-only fields', () => {
    const row = legacyNotification({ ...NATIVE, id: 'native-1', eagleId: 'eagle-1' });

    expect(row._id).toBe('eagle-1');
    expect(Object.keys(row)).not.toContain('id');
    expect(Object.keys(row)).not.toContain('eagleId');
    expect(Object.keys(row)).not.toContain('sourceSystem');
    expect(Object.keys(row)).not.toContain('isPublished');
  });

  it('keeps the period fields eagle-api writes back from the body', () => {
    const row = legacyNotification(NATIVE);

    expect(row.pcp).toBe('open');
    expect(row.isMet).toBeTrue();
    expect(row.metURL).toBe('https://engage.example/pcp');
    expect(row.associatedProjectId).toBe('5885109faaecd9001b81314c');
  });

  it('derives read from isPublished when DEMI leaves read out', () => {
    expect(legacyNotification(NATIVE).read).toEqual(['public']);
    expect(legacyNotification({ ...NATIVE, isPublished: false }).read).toEqual([]);
  });

  it('keeps the staff read array when DEMI sends it', () => {
    expect(legacyNotification({ ...NATIVE, read: ['staff', 'sysadmin'] }).read).toEqual(['staff', 'sysadmin']);
  });
});

describe('notificationSort', () => {
  it('passes name and received date through with their direction', () => {
    expect(notificationSort('+name')).toBe('name');
    expect(notificationSort('-name')).toBe('-name');
    expect(notificationSort('-notificationReceivedDate')).toBe('-notificationReceivedDate');
  });

  it('passes the type, sub type, region and decision columns through with their direction', () => {
    for (const field of ['type', 'subType', 'region', 'decision']) {
      expect(notificationSort(`+${field}`)).toBe(field);
      expect(notificationSort(`-${field}`)).toBe(`-${field}`);
    }
  });

  it('drops keys no notification column sorts on so its default order applies', () => {
    expect(notificationSort('-_id')).toBeUndefined();
    expect(notificationSort('+proponent')).toBeUndefined();
    expect(notificationSort('')).toBeUndefined();
    expect(notificationSort(null)).toBeUndefined();
  });
});
