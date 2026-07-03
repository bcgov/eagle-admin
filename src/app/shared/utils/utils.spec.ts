import { encodeString } from './utils';
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

