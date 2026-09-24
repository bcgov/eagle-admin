import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const SHORT_HEADLINE_MAX = 70;
export const SUMMARY_MAX = 280;
export const IMAGES_MAX = 5;
export const IMAGE_CAPTION_MAX = 300;
export const IMAGE_CREDIT_MAX = 150;
export const CORPORATE_CATEGORY = 'Corporate';
export const UPDATE_CONFLICT_MESSAGE = 'This update was changed by someone else. Reload to see the latest.';

/** The API answers 409 when the sent dateUpdated no longer matches the stored row. */
export const isConflict = (error: any): boolean => error?.status === 409;

export type UpdateStatus = 'draft' | 'published' | 'archived';
export type PublishAction = 'draft' | 'publish' | 'schedule';
export type StatusLabel = 'Draft' | 'Published' | 'Scheduled' | 'Archived';

export interface StatusFields {
  status: UpdateStatus;
  active: boolean;
  publishDate: Date | null;
}

/** Names of every List item of the given type, e.g. `updateCategory`. */
export function listNames(lists: any[], type: string): string[] {
  return (lists || []).filter(item => item.type === type).map(item => item.name);
}

/** Empty is valid; anything else must parse as an http or https URL. */
export const httpUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = (control.value || '').trim();
  if (!value) {
    return null;
  }
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:' ? null : { httpUrl: true };
  } catch {
    return { httpUrl: true };
  }
};

/** Caption and credit length errors for an image. */
function imageTextErrors(caption: string | null, credit: string | null): ValidationErrors {
  const errors: ValidationErrors = {};
  if ((caption || '').length > IMAGE_CAPTION_MAX) {
    errors.captionTooLong = true;
  }
  if ((credit || '').length > IMAGE_CREDIT_MAX) {
    errors.creditTooLong = true;
  }
  return errors;
}

/** Group rules: alt text and caption/credit limits for a featured image; subject for Corporate, project for the rest. */
export const updateRulesValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const value = (name: string) => group.get(name)?.value;
  const errors: ValidationErrors = value('featuredImageDocument')
    ? imageTextErrors(value('featuredImageCaption'), value('featuredImageCredit'))
    : {};

  if (value('featuredImageDocument') && !(value('featuredImageAlt') || '').trim()) {
    errors.altRequired = true;
  }

  const category = value('category');
  if (category === CORPORATE_CATEGORY) {
    if (!value('subject')) {
      errors.subjectRequired = true;
    }
  } else if (category) {
    const project = group.get('project');
    // A disabled project select means the post type has no project (Project Notification PCP).
    if (project && project.enabled && !project.value) {
      errors.projectRequired = true;
    }
  }

  return Object.keys(errors).length ? errors : null;
};

/** Photo row rules: every row needs a picked document and alt text; caption and credit stay within limits. */
export const imageRowValidator: ValidatorFn = (row: AbstractControl): ValidationErrors | null => {
  const errors = imageTextErrors(row.get('caption')?.value, row.get('credit')?.value);
  if (!row.get('document')?.value) {
    errors.documentRequired = true;
  }
  if (!(row.get('alt')?.value || '').trim()) {
    errors.altRequired = true;
  }
  return Object.keys(errors).length ? errors : null;
};

/** Id of a document reference the API sends either populated or as a bare id. */
export const documentId = (doc: any): string | null => doc?._id ?? doc ?? null;

/**
 * Map an authoring action to the stored status fields. `active` follows status so
 * readers that still filter on `active`/`read[]` stay in step.
 */
export function publishFields(action: PublishAction, publishDate: Date | null, now = new Date()): StatusFields {
  switch (action) {
    case 'publish':
      // Null lets the API stamp the publish time with its own clock.
      return { status: 'published', active: true, publishDate: null };
    case 'schedule':
      if (!publishDate || publishDate <= now) {
        throw new Error('Pick a publish date in the future to schedule.');
      }
      return { status: 'published', active: true, publishDate };
    default:
      return { status: 'draft', active: false, publishDate };
  }
}

type StoredEntry = { status?: string; active?: boolean; publishDate?: string | Date };

/** Stored status. Rows saved before `status` existed fall back to `active`. */
export function storedStatus(entry: StoredEntry): UpdateStatus {
  return (entry.status as UpdateStatus) || (entry.active ? 'published' : 'draft');
}

/** Fields for a plain Save of an existing Update: status stays as it is. */
export function keepStatusFields(entry: StoredEntry, publishDate: Date | null): StatusFields {
  const status = storedStatus(entry);
  const stored = entry.publishDate ? new Date(entry.publishDate) : null;
  return { status, active: status === 'published', publishDate: publishDate ?? stored };
}

/** Status shown to staff. */
export function statusLabel(entry: StoredEntry, now = new Date()): StatusLabel {
  const status = storedStatus(entry);
  if (status === 'archived') {
    return 'Archived';
  }
  if (status === 'published') {
    return entry.publishDate && new Date(entry.publishDate) > now ? 'Scheduled' : 'Published';
  }
  return 'Draft';
}

/** Public-page summary: the summary field, else the first non-empty paragraph of the body, tags stripped. */
export function summaryOrFallback(summary: string, content: string): string {
  if (summary && summary.trim()) {
    return summary.trim();
  }
  const doc = new DOMParser().parseFromString(content || '', 'text/html');
  const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => (p.textContent || '').trim());
  const first = paragraphs.find(text => text) ?? (doc.body.textContent || '').trim();
  return first.slice(0, SUMMARY_MAX);
}
