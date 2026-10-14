import { createProjectTabModifiers, encodeString, filterCompareWith } from './utils';
import { sanitizeHighlight } from './sanitize-highlight';

describe('Utils', () => {
  const filenameWithSpaces = 'Ajax Mine - Information Bulletin.pdf';
  const filenameWithSlashes = 'Ajax Lead/Silver/Zinc Mine';
  const filenameWithParens = 'Ajax (Mine)';
  const filennameWithMixed = 'Ajax (Mine) Lead/Silver {Tag}';

  it('TEST1: spaces in document links', () => {
    const encodedFilename = encodeString(filenameWithSpaces, true);
    const expectedFilename = 'Ajax%20Mine%20-%20Information%20Bulletin.pdf';
    expect(encodedFilename).toBe(expectedFilename);
  });

  it('TEST2: slashes in document links', () => {
    const encodedFilename = encodeString(filenameWithSlashes, true);
    const expectedFilename = 'Ajax%20Lead_Silver_Zinc%20Mine';
    expect(encodedFilename).toBe(expectedFilename);
  });

  it('TEST3: parens in document links', () => {
    const encodedFilename = encodeString(filenameWithParens, true);
    const expectedFilename = 'Ajax%20%28Mine%29';
    expect(encodedFilename).toBe(expectedFilename);
  });

  it('TEST4: multiple replacements in document links', () => {
    const encodedFilename = encodeString(filennameWithMixed, true);
    const expectedFilename = 'Ajax%20%28Mine%29%20Lead_Silver%20%7BTag%7D';
    expect(encodedFilename).toBe(expectedFilename);
  });
});

describe('filterCompareWith', () => {
  it('matches two List rows with the same id', () => {
    expect(filterCompareWith({ id: 'a1', name: 'Phase' }, { id: 'a1', name: 'Phase (copy)' })).toBeTrue();
  });

  it('does not match List rows with different ids', () => {
    expect(filterCompareWith({ id: 'a1' }, { id: 'b2' })).toBeFalse();
  });

  it('matches organizations by their _id', () => {
    expect(filterCompareWith({ _id: 'o1', id: 'x' }, { _id: 'o1', id: 'y' })).toBeTrue();
  });

  it('matches regions by code', () => {
    expect(filterCompareWith({ code: 'north', id: 'x' }, { code: 'north', id: 'y' })).toBeTrue();
  });
});

describe('createProjectTabModifiers', () => {
  const lists = [
    { id: 'type02', type: 'doctype', name: 'Application Materials', legislation: 2002 },
    { id: 'mile18', type: 'label', name: 'Revised EAC Application', legislation: 2018 },
    { id: 'amend02', type: 'projectPhase', name: 'Post Decision - Amendment', legislation: 2002 },
    { id: 'early02', type: 'projectPhase', name: 'Early Engagement', legislation: 2002 }
  ];

  it('builds the query from List row ids', () => {
    const modifier = createProjectTabModifiers(lists);

    expect(modifier.type.split(',')).toContain('type02');
    expect(modifier.milestone.split(',')).toContain('mile18');
  });

  it('leaves the amendment phase out of the project phases', () => {
    expect(createProjectTabModifiers(lists).projectPhase).toBe('early02');
  });
});

describe('sanitizeHighlight', () => {
  it('should preserve mark tags and decode entities safely', () => {
    const raw = 'Hello <mark>World</mark> &amp; Everyone!';
    expect(sanitizeHighlight(raw)).toBe('Hello <mark>World</mark> & Everyone!');
  });

  it('should escape raw HTML tags in plain text portions to prevent XSS', () => {
    const raw = 'Attack <script>alert(1)</script> <mark>Vulnerable</mark> <div>nested</div>';
    const clean = sanitizeHighlight(raw);
    expect(clean).toBe('Attack &lt;script&gt;alert(1)&lt;/script&gt; <mark>Vulnerable</mark> &lt;div&gt;nested&lt;/div&gt;');
  });
});

