import { Project } from '../project';
import { List } from './list';
import { DemiProject } from './project';
import { toDemiProjectWrite } from './project-write';

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
const write = (form: object, row: Partial<DemiProject> = {}) =>
  toDemiProjectWrite(new Project({ _id: 'p1', name: 'Mine', ...form }), LISTS, { id: '7', name: 'Mine', ...row });

describe('toDemiProjectWrite', () => {
  it('turns a picked List id into the ref DEMI stores', () => {
    expect(write({ eacDecision: 'dec1' }).eacDecision)
      .toEqual({ _id: 'dec1', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018 });
  });

  it('keeps the List row\'s item link on the ref', () => {
    expect((write({ applicableRegulation: 'reg1' }).applicableRegulation as { item: string }).item)
      .toBe('https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/243_2019');
  });

  it('keeps the stored ref for an id the Lists lack', () => {
    const stored = { _id: 'old-dec', name: 'Certificate Issued (2002)', type: 'eaDecisions', legislation: 2002 };

    expect(write({ eacDecision: 'old-dec' }, { eacDecision: stored }).eacDecision).toEqual(stored);
  });

  it('sets the stage to the phase name, as eagle-api did on save', () => {
    expect(write({ currentPhaseName: 'phase1' }).projectState).toBe('Pre-Application');
  });

  it('appends a new phase to the stored phase history', () => {
    const body = write({ currentPhaseName: 'phase2' }, { currentPhaseName: PHASE1, phaseHistory: [PHASE1] });

    expect((body.phaseHistory as { _id: string }[]).map(ref => ref._id)).toEqual(['phase1', 'phase2']);
  });

  it('compares a new phase with the last history entry, as eagle-api did', () => {
    const body = write({ currentPhaseName: 'phase1' }, { currentPhaseName: PHASE1, phaseHistory: [PHASE1, PHASE2] });

    expect((body.phaseHistory as { _id: string }[]).map(ref => ref._id)).toEqual(['phase1', 'phase2', 'phase1']);
  });

  it('leaves the phase history alone when the phase is unchanged', () => {
    expect('phaseHistory' in write({ currentPhaseName: 'phase1' }, { currentPhaseName: PHASE1 })).toBeFalse();
  });

  it('sends null for an emptied field, so DEMI clears it', () => {
    expect(write({ CEAALink: '' }).CEAALink).toBeNull();
  });

  it('keeps a stored No or unset answer on a No, and turns a stored Yes into false', () => {
    const body = write({ substantially: false, dispute: false }, { substantially: false, dispute: null });

    expect(body.substantially).toBeFalse();
    expect(body.dispute).toBeNull();
    expect(write({ substantially: false }, { substantially: true }).substantially).toBeFalse();
  });

  it('keeps the stored Track type when the picker key differs only in spacing', () => {
    expect(write({ type: 'Energy-Petroleum & Natural Gas' }, { projectType: 'Energy - Petroleum & Natural Gas' }).projectType)
      .toBe('Energy - Petroleum & Natural Gas');
    expect(write({ type: 'Mines' }, { projectType: 'Energy - Petroleum & Natural Gas' }).projectType).toBe('Mines');
  });

  it('clears a contact\'s stored name with its id', () => {
    const body = write({ responsibleEPDId: null, projectLeadId: 'u1' });

    expect(body.responsibleEPD).toBeNull();
    expect('projectLead' in body).toBeFalse();
  });

  it('leaves out a field the form does not edit, so DEMI keeps it', () => {
    const body = write({});

    expect('abbreviation' in body).toBeFalse();
    expect('legislationYear' in body).toBeFalse();
    expect('applicableRegulation' in body).toBeFalse();
  });

  it('stores intake notes as investmentNotes over the stored intake', () => {
    expect(write({ intake: { investment: 5, notes: 'Phase 1' } }, { intake: { investment: 4, notes: null, investmentNotes: null } }).intake)
      .toEqual({ investment: 5, notes: null, investmentNotes: 'Phase 1' });
  });

  it('sends no point when a coordinate is blank', () => {
    expect(write({ centroid: ['', '50.7'] }).centroid).toBeNull();
  });
});
