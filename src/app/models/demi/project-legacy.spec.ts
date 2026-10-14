import { toLegacyProject } from './project-legacy';

describe('toLegacyProject', () => {
  const row = {
    id: '7',
    eagleId: '5885109faaecd9001b81314c',
    name: 'Ashcroft Ranch Landfill',
    projectType: 'Waste Disposal',
    proponentId: 'org1',
    proponentName: 'Greater Vancouver Sewerage and Drainage District',
    centroid: { type: 'Point', coordinates: [-121.3333, 50.7167] },
    build: 'new',
    legislationYear: 2002,
    eacDecision: { _id: 'l1', name: 'Certificate Refused' },
    pins: [{ _id: 'org2', name: 'Pinned Org' }]
  };

  it('keys the legacy project on the Eagle id and keeps the DEMI id beside it', () => {
    const project = toLegacyProject(row);

    expect(project._id).toBe('5885109faaecd9001b81314c');
    expect(project.demiId).toBe('7');
  });

  it('renames native fields to their Eagle names', () => {
    const project = toLegacyProject(row);

    expect(project.type).toBe('Waste Disposal');
    expect(project.proponent).toEqual({ _id: 'org1', name: 'Greater Vancouver Sewerage and Drainage District' });
    expect(project.centroid).toEqual([-121.3333, 50.7167]);
  });

  it('passes fields that share the Eagle name through', () => {
    const project = toLegacyProject(row);

    expect(project.legislationYear).toBe(2002);
    expect(project.eacDecision.name).toBe('Certificate Refused');
    expect(project.pins).toEqual([{ _id: 'org2', name: 'Pinned Org' }]);
  });

  it('leaves _id null on a row without an Eagle id', () => {
    expect(toLegacyProject({ id: '9', name: 'Track only' })._id).toBeNull();
  });
});
