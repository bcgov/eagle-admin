import * as _ from 'lodash';
import { Document } from 'app/models/document';

export class Comment {
  _id: string;
  author: string;
  comment: string;
  commentId: number;
  dateAdded: Date;
  datePosted: Date;
  dateUpdated: Date;
  eaoNotes: string;
  eaoStatus: string;
  isAnonymous: boolean;
  location: string;
  period: string;
  proponentNotes: string;
  proponentStatus: string;
  publishedNotes: string;
  rejectedNotes: string;
  rejectedReason: string;
  valuedComponents: Array<string>;
  documents: Array<string>;

  // Used for comment review.
  documentsList: Array<Document>;

  // Permissions
  read: Array<string> = [];
  write: Array<string> = [];
  delete: Array<string> = [];

  constructor(obj?: any) {
    this._id              = obj && obj._id              || null;
    this.author           = obj && obj.author           || null;
    this.commentId        = obj && obj.commentId        || null;
    this.dateAdded        = obj && obj.dateAdded        || null;
    this.datePosted       = obj && obj.datePosted       || null;
    this.dateUpdated      = obj && obj.dateUpdated      || null;
    this.delete           = obj && obj.delete           || null;
    this.eaoNotes         = obj && obj.eaoNotes         || null;
    this.eaoStatus        = obj && obj.eaoStatus        || null;
    this.isAnonymous      = obj && obj.isAnonymous      || null;
    this.location         = obj && obj.location         || null;
    this.period           = obj && obj.period           || null;
    this.proponentNotes   = obj && obj.proponentNotes   || null;
    this.proponentStatus  = obj && obj.proponentStatus  || null;
    this.publishedNotes   = obj && obj.publishedNotes   || null;
    this.rejectedNotes    = obj && obj.rejectedNotes    || null;
    this.rejectedReason   = obj && obj.rejectedReason   || null;
    this.valuedComponents = obj && obj.valuedComponents || null;
    this.documents        = obj && obj.documents        || null;
    this.documentsList    = obj && obj.documentsList    || [];

    this.read             = obj && obj.read             || null;
    this.write            = obj && obj.write            || null;
    this.delete           = obj && obj.delete           || null;

    if (obj && obj.dateAdded) {
      this.dateAdded = new Date(obj.dateAdded);
    }

    if (obj && obj.datePosted) {
      this.datePosted = new Date(obj.datePosted);
    }

    if (obj && obj.dateUpdated) {
      this.dateUpdated = new Date(obj.dateUpdated);
    }

    // replace \\n (JSON format) with newlines
    if (obj && obj.comment) {
      this.comment = obj.comment.replace(/\\n/g, '\n');
    }
  }
}
