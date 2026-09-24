import { blocksPublish, captionLine, imageSrc, toUpdateImage } from './update-images';

describe('update images', () => {
  describe('blocksPublish', () => {
    it('blocks a project document the public cannot read', () => {
      expect(blocksPublish({ documentSource: 'PROJECT', read: ['staff', 'sysadmin'] })).toBeTrue();
    });

    it('lets a public project document through', () => {
      expect(blocksPublish({ documentSource: 'PROJECT', read: ['staff', 'public'] })).toBeFalse();
    });

    it('lets a non-public Update upload through, it goes public with the Update', () => {
      expect(blocksPublish({ documentSource: 'UPDATE', read: [] })).toBeFalse();
    });

    it('does not block a document whose read list has not loaded', () => {
      expect(blocksPublish({ _id: 'd1' })).toBeFalse();
    });

    it('does not block a missing document', () => {
      expect(blocksPublish(undefined)).toBeFalse();
    });
  });

  describe('imageSrc', () => {
    const publicDoc = { _id: 'd1', documentFileName: 'dam.jpg', documentSource: 'PROJECT', read: ['public'] };
    const privateDoc = { _id: 'd2', documentFileName: 'plan.jpg', documentSource: 'PROJECT', read: ['staff'] };
    const docs = new Map<string, any>([['d1', publicDoc], ['d2', privateDoc]]);

    it('has no source without an id', () => {
      expect(imageSrc(null, docs, new Map())).toBeNull();
    });

    it('uses the public fetch URL for a public document', () => {
      expect(imageSrc('d1', docs, new Map())).toBe('/api/document/d1/fetch/dam.jpg');
    });

    it('has no source for a non-public document with no loaded preview', () => {
      expect(imageSrc('d2', docs, new Map())).toBeNull();
    });

    it('prefers a loaded preview over the fetch URL', () => {
      expect(imageSrc('d1', docs, new Map([['d1', 'blob:local-d1']]))).toBe('blob:local-d1');
    });
  });

  describe('toUpdateImage', () => {
    it('trims alt, caption and credit', () => {
      expect(toUpdateImage({ document: 'd1', alt: ' Dam ', caption: ' Spillway ', credit: ' EAO ' }))
        .toEqual({ document: 'd1', alt: 'Dam', caption: 'Spillway', credit: 'EAO' });
    });

    it('leaves out a blank caption and credit', () => {
      const image = toUpdateImage({ document: 'd1', alt: 'Dam', caption: '   ', credit: '' });
      expect(Object.entries(image).filter(([, value]) => value !== undefined).map(([key]) => key)).toEqual(['document', 'alt']);
    });

    it('sends empty alt text rather than null', () => {
      expect(toUpdateImage({ document: 'd1', alt: null as any }).alt).toBe('');
    });
  });

  describe('captionLine', () => {
    it('joins caption and credit', () => {
      expect(captionLine({ caption: 'Spillway', credit: 'EAO' })).toBe('Spillway Credit: EAO');
    });

    it('shows the credit alone when there is no caption', () => {
      expect(captionLine({ credit: 'EAO' })).toBe('Credit: EAO');
    });

    it('shows the caption alone when there is no credit', () => {
      expect(captionLine({ caption: 'Spillway', credit: '' })).toBe('Spillway');
    });

    it('is empty with neither', () => {
      expect(captionLine({})).toBe('');
    });
  });
});
