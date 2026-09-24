import { FormControl, FormGroup } from '@angular/forms';
import {
  documentId, httpUrlValidator, imageRowValidator, keepStatusFields, publishFields, statusLabel, summaryOrFallback, updateRulesValidator
} from './update-rules';

const NOW = new Date('2026-09-23T12:00:00Z');
const PAST = new Date('2026-09-01T12:00:00Z');
const FUTURE = new Date('2026-10-01T12:00:00Z');

function updateForm(values: Record<string, unknown>, projectDisabled = false): FormGroup {
  const group = new FormGroup({
    category: new FormControl(values.category ?? null),
    subject: new FormControl(values.subject ?? null),
    project: new FormControl({ value: values.project ?? '', disabled: projectDisabled }),
    featuredImageDocument: new FormControl(values.featuredImageDocument ?? null),
    featuredImageAlt: new FormControl(values.featuredImageAlt ?? ''),
    featuredImageCaption: new FormControl(values.featuredImageCaption ?? ''),
    featuredImageCredit: new FormControl(values.featuredImageCredit ?? '')
  }, { validators: updateRulesValidator });
  return group;
}

function imageRow(values: Record<string, unknown>): FormGroup {
  return new FormGroup({
    document: new FormControl(values.document ?? null),
    alt: new FormControl(values.alt ?? ''),
    caption: new FormControl(values.caption ?? ''),
    credit: new FormControl(values.credit ?? '')
  }, { validators: imageRowValidator });
}

describe('update rules', () => {
  describe('httpUrlValidator', () => {
    it('accepts an https link', () => {
      expect(httpUrlValidator(new FormControl('https://engage.gov.bc.ca/x'))).toBeNull();
    });

    it('accepts an empty value, the field is optional', () => {
      expect(httpUrlValidator(new FormControl(''))).toBeNull();
    });

    it('rejects a javascript: link', () => {
      expect(httpUrlValidator(new FormControl('javascript:alert(1)'))).toEqual({ httpUrl: true });
    });

    it('rejects text that is not a URL', () => {
      expect(httpUrlValidator(new FormControl('engage.gov.bc.ca'))).toEqual({ httpUrl: true });
    });
  });

  describe('updateRulesValidator', () => {
    it('needs alt text once a featured image is picked', () => {
      const form = updateForm({ category: 'Project News', project: 'p1', featuredImageDocument: 'd1', featuredImageAlt: '  ' });
      expect(form.hasError('altRequired')).toBeTrue();
    });

    it('passes a featured image that has alt text', () => {
      const form = updateForm({ category: 'Project News', project: 'p1', featuredImageDocument: 'd1', featuredImageAlt: 'Mine site' });
      expect(form.valid).toBeTrue();
    });

    it('needs a subject for a Corporate update', () => {
      const form = updateForm({ category: 'Corporate' });
      expect(form.hasError('subjectRequired')).toBeTrue();
    });

    it('lets a Corporate update with a subject go without a project', () => {
      const form = updateForm({ category: 'Corporate', subject: 'Policy' });
      expect(form.valid).toBeTrue();
    });

    it('needs a project for any other category', () => {
      const form = updateForm({ category: 'Engagement' });
      expect(form.hasError('projectRequired')).toBeTrue();
    });

    it('does not ask for a project when the post type has none', () => {
      const form = updateForm({ category: 'Engagement' }, true);
      expect(form.hasError('projectRequired')).toBeFalse();
    });

    it('refuses a featured image caption over 300 characters', () => {
      const form = updateForm({ category: 'Engagement', project: 'p1', featuredImageDocument: 'd1', featuredImageAlt: 'Dam', featuredImageCaption: 'c'.repeat(301) });
      expect(form.hasError('captionTooLong')).toBeTrue();
    });

    it('refuses a featured image credit over 150 characters', () => {
      const form = updateForm({ category: 'Engagement', project: 'p1', featuredImageDocument: 'd1', featuredImageAlt: 'Dam', featuredImageCredit: 'c'.repeat(151) });
      expect(form.hasError('creditTooLong')).toBeTrue();
    });
  });

  describe('imageRowValidator', () => {
    it('passes a row with a document and alt text', () => {
      expect(imageRow({ document: 'd1', alt: 'Dam' }).errors).toBeNull();
    });

    it('needs a document', () => {
      expect(imageRow({ alt: 'Dam' }).hasError('documentRequired')).toBeTrue();
    });

    it('needs alt text that is not only spaces', () => {
      expect(imageRow({ document: 'd1', alt: '   ' }).hasError('altRequired')).toBeTrue();
    });

    it('accepts a caption of exactly 300 characters', () => {
      expect(imageRow({ document: 'd1', alt: 'Dam', caption: 'c'.repeat(300) }).errors).toBeNull();
    });

    it('refuses a caption of 301 characters', () => {
      expect(imageRow({ document: 'd1', alt: 'Dam', caption: 'c'.repeat(301) }).errors).toEqual({ captionTooLong: true });
    });

    it('accepts a credit of exactly 150 characters', () => {
      expect(imageRow({ document: 'd1', alt: 'Dam', credit: 'c'.repeat(150) }).errors).toBeNull();
    });

    it('refuses a credit of 151 characters', () => {
      expect(imageRow({ document: 'd1', alt: 'Dam', credit: 'c'.repeat(151) }).errors).toEqual({ creditTooLong: true });
    });
  });

  describe('documentId', () => {
    it('keeps a bare id', () => {
      expect(documentId('d1')).toBe('d1');
    });

    it('reads the id of a populated document', () => {
      expect(documentId({ _id: 'd1', displayName: 'Dam' })).toBe('d1');
    });

    it('is null for no document', () => {
      expect(documentId(null)).toBeNull();
    });

    it('is null for an undefined document', () => {
      expect(documentId(undefined)).toBeNull();
    });
  });

  describe('publishFields', () => {
    it('saves a draft as not active', () => {
      const fields = publishFields('draft', null, NOW);
      expect(fields.status).toBe('draft');
      expect(fields.active).toBeFalse();
    });

    it('publishes with no date so the API stamps the time', () => {
      const fields = publishFields('publish', FUTURE, NOW);
      expect(fields.status).toBe('published');
      expect(fields.active).toBeTrue();
      expect(fields.publishDate).toBeNull();
    });

    it('schedules as published with the future date', () => {
      const fields = publishFields('schedule', FUTURE, NOW);
      expect(fields.status).toBe('published');
      expect(fields.publishDate).toEqual(FUTURE);
    });

    it('refuses to schedule for a date that has passed', () => {
      expect(() => publishFields('schedule', PAST, NOW)).toThrowError(/future/);
    });
  });

  describe('keepStatusFields', () => {
    it('keeps a scheduled Update published with its date', () => {
      const fields = keepStatusFields({ status: 'published', publishDate: FUTURE }, FUTURE);
      expect(fields.status).toBe('published');
      expect(fields.active).toBeTrue();
      expect(fields.publishDate).toEqual(FUTURE);
    });

    it('sends the stored publish date when the date field is blank', () => {
      expect(keepStatusFields({ status: 'published', publishDate: PAST }, null).publishDate).toEqual(PAST);
    });

    it('keeps a draft as a draft', () => {
      const fields = keepStatusFields({ status: 'draft' }, null);
      expect(fields.status).toBe('draft');
      expect(fields.active).toBeFalse();
    });

    it('keeps an old active row with no status published', () => {
      expect(keepStatusFields({ active: true }, null).status).toBe('published');
    });
  });

  describe('statusLabel', () => {
    it('shows a published row with a future date as Scheduled', () => {
      expect(statusLabel({ status: 'published', publishDate: FUTURE }, NOW)).toBe('Scheduled');
    });

    it('shows a published row with a past date as Published', () => {
      expect(statusLabel({ status: 'published', publishDate: PAST }, NOW)).toBe('Published');
    });

    it('shows an archived row as Archived even if still active', () => {
      expect(statusLabel({ status: 'archived', active: true }, NOW)).toBe('Archived');
    });

    it('reads an old active row with no status as Published', () => {
      expect(statusLabel({ active: true }, NOW)).toBe('Published');
    });

    it('reads an old inactive row with no status as Draft', () => {
      expect(statusLabel({ active: false }, NOW)).toBe('Draft');
    });
  });

  describe('summaryOrFallback', () => {
    it('uses the summary when one is written', () => {
      expect(summaryOrFallback('Short text', '<p>Body</p>')).toBe('Short text');
    });

    it('falls back to the first paragraph without tags', () => {
      expect(summaryOrFallback('', '<p>First <b>part</b></p><p>Second</p>')).toBe('First part');
    });

    it('skips empty leading paragraphs', () => {
      expect(summaryOrFallback('', '<p>&nbsp;</p><p></p><p>Real text</p>')).toBe('Real text');
    });

    it('cuts the fallback at 280 characters', () => {
      expect(summaryOrFallback('', `<p>${'a'.repeat(300)}</p>`).length).toBe(280);
    });
  });
});
