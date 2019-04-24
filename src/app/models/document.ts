import * as _ from 'lodash';

export class Document {
  _id: string;
  project: string;
  documentFileName: string;
  internalOriginalName: string;
  internalURL: string;
  passedAVCheck: boolean;
  internalMime: string;
  internalSize: string;
  documentSource: string;
  displayName: string;
  milestone: string;
  dateUploaded: string;
  datePosted: string;
  type: string;
  description: string;
  documentAuthor: string;
  eaoStatus: string;
  documentDate: Date;
  dateUpdated: Date;

  checkbox: boolean;
  upfile: File;
  labels: any[];
  isPublished = false; // depends on tags; see below

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.project = obj && obj.project || null;

    this.documentFileName = obj && obj.documentFileName || null;
    this.internalOriginalName = obj && obj.internalOriginalName || null;
    this.internalURL = obj && obj.internalURL || null;
    this.passedAVCheck = obj && obj.passedAVCheck || null;
    this.internalMime = obj && obj.internalMime || null;
    this.internalSize = obj && obj.internalSize || null;
    this.documentSource = obj && obj.documentSource || null;

    this.displayName = obj && obj.displayName || null;
    this.milestone = obj && obj.milestone || null;
    this.dateUploaded = obj && obj.dateUploaded || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.documentDate = obj && obj.documentDate || null;
    this.type = obj && obj.type || null;
    this.description = obj && obj.description || null;
    this.documentAuthor = obj && obj.documentAuthor || null;
    this.eaoStatus = obj && obj.eaoStatus || null;

    this.checkbox = obj && obj.checkbox || null;
    this.upfile = obj && obj.upfile || null;
    this.labels = obj && obj.labels || null;
  }
}
