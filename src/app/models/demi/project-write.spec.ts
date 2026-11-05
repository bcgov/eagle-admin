import { Project } from '../project';
import { List } from './list';
import { DemiProject } from './project';
import { DEFAULT_CENTROID, toDemiProjectWrite } from './project-write';

const LISTS: List[] = [
  { id: 'phase1', name: 'Pre-Application', type: 'projectPhase', legislation: 2018, listOrder: 1 },
  { id: 'phase2', name: 'Application Review', type: 'projectPhase', legislation: 2018, listOrder: 2 },
  { id: 'dec1', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018, listOrder: 2 },
  { id: 'reg1', name: 'Reviewable Projects Regulation', type: 'applicableRegulations', legislation: 2018, listOrder: 1,
    item: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/243_2019' }
];

const PHASE1 = { _id: 'phase1', name: 'Pre-Application', type: 'projectPhase', legislation: 2018 };
const PHASE2 = { _id: 'phase2', name: 'Application Review', type: 'projectPhase', legislation: 2018 };

// Built the way the edit form builds its save: `new Project` over the form values.
const write = (form: object, row: Partial<DemiProject> = {}, held?: string[]) =>
  toDemiProjectWrite(new Project({ _id: 'p1', name: 'Mine', ...form }), LISTS, { id: '7', name: 'Mine', ...row }, held);

// What the form sends for the local day it shows a stored date as: that day's local midnight.
const shownDay = (iso: string, days = 0) => {
  const day = new Date(iso);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate() + days).toISOString();
};

describe('toDemiProjectWrite', () => {
  it('turns a picked List id into the ref DEMI stores', () => {
    expect(write({ eacDecision: 'dec1' }).eacDecision)
      .toEqual({ _id: 'dec1', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018 });
  });

  it('keeps the List row\'s item link on the ref', () => {
    expect((write({ applicableRegulation: 'reg1' }).applicableRegulation as { item: string }).item)
      .toBe('https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/243_2019');
  });

  it('leaves a stored ref, with its extra keys, out when its id is picked again', () => {
    const stored = { _id: 'dec1', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018, listOrder: 2, _schemaName: 'List' };

    expect('eacDecision' in write({ eacDecision: 'dec1' }, { eacDecision: stored })).toBeFalse();
    expect('applicableRegulation' in write({ applicableRegulation: 'reg1' }, { applicableRegulation: 'reg1' })).toBeFalse();
  });

  it('leaves out a List row default the user did not pick, with the stage and history, on create and on edit', () => {
    // The create form's phase starts as the first List row, which has `id` but no `_id`.
    const listRow = { id: 'phase1', name: 'Pre-Application', type: 'projectPhase', legislation: 2018, listOrder: 1 };
    const created = toDemiProjectWrite(new Project({ name: 'New', currentPhaseName: listRow }), LISTS, {} as DemiProject);
    const edited = write({ currentPhaseName: listRow, eacDecision: { ...listRow, id: 'dec1' } }, { currentPhaseName: PHASE2, projectState: 'Closed' });

    for (const body of [created, edited]) {
      expect('currentPhaseName' in body).toBeFalse();
      expect('projectState' in body).toBeFalse();
      expect('phaseHistory' in body).toBeFalse();
    }
    expect('eacDecision' in edited).toBeFalse();
  });

  it('sets the stage to the phase name when the phase changes, as eagle-api did on save', () => {
    expect(write({ currentPhaseName: 'phase1' }).projectState).toBe('Pre-Application');
    expect(write({ currentPhaseName: 'phase2' }, { currentPhaseName: PHASE1, projectState: 'Closed' }).projectState).toBe('Application Review');
  });

  it('appends a new phase to the stored phase history', () => {
    const body = write({ currentPhaseName: 'phase2' }, { currentPhaseName: PHASE1, phaseHistory: [PHASE1] });

    expect((body.phaseHistory as { _id: string }[]).map(ref => ref._id)).toEqual(['phase1', 'phase2']);
  });

  it('compares a new phase with the last history entry, as eagle-api did', () => {
    const body = write({ currentPhaseName: 'phase2' }, { currentPhaseName: PHASE1, phaseHistory: [PHASE1, PHASE2] });

    expect(body.currentPhaseName).toEqual(PHASE2);
    expect('phaseHistory' in body).toBeFalse();
  });

  it('leaves the phase, its history and the stage alone when the phase is unchanged', () => {
    const body = write({ currentPhaseName: 'phase1' }, { currentPhaseName: PHASE1, phaseHistory: [PHASE1, PHASE2], projectState: 'Closed' });

    expect('currentPhaseName' in body).toBeFalse();
    expect('phaseHistory' in body).toBeFalse();
    expect('projectState' in body).toBeFalse();
  });

  it('sends null for an emptied field, so DEMI clears it', () => {
    expect(write({ CEAALink: '' }, { CEAALink: 'https://iaac.example/1' }).CEAALink).toBeNull();
  });

  it('leaves out a field empty in both the form and the row', () => {
    expect('CEAALink' in write({ CEAALink: '' })).toBeFalse();
  });

  it('leaves out a cleared field the tab\'s form does not hold, and holds the stage with the phase', () => {
    const row = { eaStatusDate: '2024-03-15T07:00:00.000Z', dispute: true, projectState: 'Closed' };

    const body = write({ currentPhaseName: 'phase1' }, row, ['name']);
    expect('eaStatusDate' in body).toBeFalse();
    expect('dispute' in body).toBeFalse();
    expect('projectState' in body).toBeFalse();
    expect(write({ currentPhaseName: 'phase1' }, row, ['currentPhaseName']).projectState).toBe('Pre-Application');
  });

  it('keeps a stored date the form shows as the same day, and sends another day', () => {
    const stored = '2024-03-15T07:00:00.000Z';

    expect('eaStatusDate' in write({ eaStatusDate: shownDay(stored) }, { eaStatusDate: stored })).toBeFalse();
    expect(write({ decisionDate: shownDay(stored, 1) }, { decisionDate: stored }).decisionDate).toBe(shownDay(stored, 1));
  });

  it('keeps a stored No or unset answer on a No, and turns a stored Yes into false', () => {
    const body = write({ substantially: false, dispute: false }, { substantially: false, dispute: null });

    expect('substantially' in body).toBeFalse();
    expect('dispute' in body).toBeFalse();
    expect(write({ substantially: false }, { substantially: true }).substantially).toBeFalse();
  });

  it('keeps the stored Track type when the picker key differs only in spacing', () => {
    expect('projectType' in write({ type: 'Energy-Petroleum & Natural Gas' }, { projectType: 'Energy - Petroleum & Natural Gas' })).toBeFalse();
    expect(write({ type: 'Mines' }, { projectType: 'Energy - Petroleum & Natural Gas' }).projectType).toBe('Mines');
  });

  it('clears a contact\'s stored name with its id', () => {
    const body = write({ responsibleEPDId: null, projectLeadId: 'u1' }, { responsibleEPDId: 'u0' });

    expect(body.responsibleEPD).toBeNull();
    expect('projectLead' in body).toBeFalse();
  });

  it('leaves out a field the form does not edit, so DEMI keeps it', () => {
    const body = write({});

    expect('abbreviation' in body).toBeFalse();
    expect('legislationYear' in body).toBeFalse();
    expect('applicableRegulation' in body).toBeFalse();
  });

  it('adds an intake key the user fills in, and clears a stored value the user empties', () => {
    expect(write({ intake: { investment: null, notes: 'Phase 1' } }, { intake: { investment: null } }).intake)
      .toEqual({ investment: null, investmentNotes: 'Phase 1' });
    expect(write({ intake: { investment: null, notes: null } }, { intake: { investment: 5 } }).intake).toEqual({ investment: null });
    expect(write({ intake: { investment: 5, notes: '' } }, { intake: { investment: 5, investmentNotes: 'Phase 1' } }).intake)
      .toEqual({ investment: 5, investmentNotes: null });
    // eagle-api's intake defaulted to a string; one stored that way is replaced, not read as an object.
    expect(write({ intake: { investment: 5, notes: null } }, { intake: 'TBD' }).intake).toEqual({ investment: 5 });
    expect('intake' in write({ intake: { investment: null, notes: null } }, { intake: 'TBD' })).toBeFalse();
  });

  it('stores intake notes as investmentNotes over the stored intake', () => {
    expect(write({ intake: { investment: 5, notes: 'Phase 1' } }, { intake: { investment: 4, notes: null, investmentNotes: null } }).intake)
      .toEqual({ investment: 5, notes: null, investmentNotes: 'Phase 1' });
  });

  it('leaves out an intake whose fields are empty over stored nulls or missing keys', () => {
    expect('intake' in write({ intake: { investment: null, notes: '' } }, { intake: { investment: null } })).toBeFalse();
  });

  it('writes no intake on a row with none when the form\'s intake is empty', () => {
    expect('intake' in write({ intake: { investment: null, notes: '' } })).toBeFalse();
  });

  it('keeps real newlines in the description', () => {
    expect(write({ description: 'Line 1\nLine 2' }).description).toBe('Line 1\nLine 2');
  });

  it('writes no default point on a stored row with none, but sends it on create', () => {
    expect('centroid' in write({ centroid: [...DEFAULT_CENTROID] }, { centroid: null })).toBeFalse();
    expect('centroid' in write({ centroid: [...DEFAULT_CENTROID] }, { centroid: { type: 'Point', coordinates: [] } })).toBeFalse();
    expect(toDemiProjectWrite(new Project({ name: 'New', centroid: [...DEFAULT_CENTROID] }), LISTS, {} as DemiProject).centroid)
      .toEqual({ type: 'Point', coordinates: [...DEFAULT_CENTROID] });
  });

  it('sends nothing when every field matches the row', () => {
    const row = {
      description: 'Open pit', sector: 'Coal', build: 'new', region: 'Peace', projectType: 'Mines', address: 'Tumbler Ridge',
      proponentId: 'org1', responsibleEPDId: 'u1', projectLeadId: 'u2', isActive: 'active', legislationYear: 2018,
      centroid: { type: 'Point', coordinates: [-121.24, 50.72] }
    };
    const form = {
      description: 'Open pit', sector: 'Coal', build: 'new', region: 'Peace', type: 'Mines', location: 'Tumbler Ridge',
      proponent: 'org1', responsibleEPDId: 'u1', projectLeadId: 'u2', activeStatus: 'active', legislationYear: 2018,
      centroid: [-121.24, 50.72]
    };

    expect(write(form, row)).toEqual({});
  });

  it('sends a point moved from the stored one', () => {
    expect(write({ centroid: [-121.3, 50.72] }, { centroid: { type: 'Point', coordinates: [-121.24, 50.72] } }).centroid)
      .toEqual({ type: 'Point', coordinates: [-121.3, 50.72] });
  });

  it('sends no point when a coordinate is blank', () => {
    expect(write({ centroid: ['', '50.7'] }, { centroid: { type: 'Point', coordinates: [-120, 50] } }).centroid).toBeNull();
  });
});
