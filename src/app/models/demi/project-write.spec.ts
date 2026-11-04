import { Project } from '../project';
import { List } from './list';
import { toDemiProjectWrite } from './project-write';

const LISTS: List[] = [
  { id: 'phase1', name: 'Pre-Application', type: 'projectPhase', legislation: 2018, listOrder: 1 },
  { id: 'dec1', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018, listOrder: 2 }
];

// Built the way the edit form builds its save: `new Project` over the form values.
const write = (form: object) => toDemiProjectWrite(new Project({ _id: 'p1', name: 'Mine', ...form }), LISTS);

describe('toDemiProjectWrite', () => {
  it('turns a picked List id into the ref DEMI stores', () => {
    expect(write({ eacDecision: 'dec1' }).eacDecision)
      .toEqual({ _id: 'dec1', name: 'Certificate Issued', type: 'eaDecisions', legislation: 2018 });
  });

  it('sets the stage to the phase name, as eagle-api did on save', () => {
    expect(write({ currentPhaseName: 'phase1' }).projectState).toBe('Pre-Application');
  });

  it('sends null for an answer the form emptied, so DEMI clears it', () => {
    const body = write({ substantially: false, CEAALink: '' });

    expect(body.substantially).toBeNull();
    expect(body.CEAALink).toBeNull();
  });

  it('leaves out a field the form does not edit, so DEMI keeps it', () => {
    const body = write({});

    expect('abbreviation' in body).toBeFalse();
    expect('legislationYear' in body).toBeFalse();
    expect('applicableRegulation' in body).toBeFalse();
  });

  it('stores intake notes as investmentNotes', () => {
    expect(write({ intake: { investment: 5, notes: 'Phase 1' } }).intake).toEqual({ investment: 5, investmentNotes: 'Phase 1' });
  });

  it('sends no point when a coordinate is blank', () => {
    expect(write({ centroid: ['', '50.7'] }).centroid).toBeNull();
  });
});
