import { FormControl, FormGroup } from '@angular/forms';
import {
  httpUrlValidator, keepStatusFields, publishFields, statusLabel, summaryOrFallback, toLocalInputValue, updateRulesValidator
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
    featuredImageAlt: new FormControl(values.featuredImageAlt ?? '')
  }, { validators: updateRulesValidator });
  return group;
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

  describe('toLocalInputValue', () => {
    it('round-trips through the datetime-local value to the same minute', () => {
      const date = new Date(2026, 9, 1, 9, 5);
      expect(new Date(toLocalInputValue(date)).getTime()).toBe(date.getTime());
    });

    it('gives an empty value for no date', () => {
      expect(toLocalInputValue(null)).toBe('');
    });
  });
});
