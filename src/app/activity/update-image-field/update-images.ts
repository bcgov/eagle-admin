import { UpdateImage } from 'src/app/models/recentActivity';
import { documentFetchUrl } from 'src/app/services/document.service';

/** documentSource of images uploaded from the Update form; the API publishes them with the Update. */
export const UPDATE_IMAGE_SOURCE = 'UPDATE';

export const isPublicDocument = (doc: any): boolean => !!doc?.read?.includes('public');

/** A picked project document the public cannot read. Update uploads do not count: they go public with the Update. */
export const blocksPublish = (doc: any): boolean =>
  Array.isArray(doc?.read) && doc.documentSource !== UPDATE_IMAGE_SOURCE && !doc.read.includes('public');

/** Name staff see for a document. */
export const documentName = (doc: any): string => doc?.displayName || doc?.documentFileName || '';

/** Image source for a document id: a loaded preview, else the public fetch URL. Anonymous fetch fails for non-public documents. */
export function imageSrc(id: string | null, docs: Map<string, any>, srcs: Map<string, string>): string | null {
  if (!id) {
    return null;
  }
  const doc = docs.get(id);
  return srcs.get(id) ?? (isPublicDocument(doc) ? documentFetchUrl(doc) : null);
}

/** Payload entry for an image row: trimmed alt, blank caption and credit left out. */
export const toUpdateImage = ({ document, alt, caption, credit }: UpdateImage): UpdateImage => ({
  document, alt: (alt || '').trim(), caption: caption?.trim() || undefined, credit: credit?.trim() || undefined
});

/** Line under a previewed image, as the public site shows it. */
export const captionLine = ({ caption, credit }: Partial<UpdateImage>): string =>
  [caption, credit ? `Credit: ${credit}` : ''].filter(Boolean).join(' ');
