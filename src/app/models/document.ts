export class Document {
  _id: string;
  notificationProject: string;
  project: string;
  documentFileName: string;
  internalOriginalName: string;
  internalURL: string;
  passedAVCheck: boolean;
  internalMime: string;
  internalSize: number;
  documentSource: string;
  displayName: string;
  milestone: string;
  dateUploaded: Date;
  type: string;
  description: string;
  documentAuthor: string;
  documentAuthorType: string;
  eaoStatus: string;
  datePosted: Date;
  dateUpdated: Date;
  projectPhase: string;
  legislation: number;
  extractionMethod: string;
  contentExtractedAt: Date;
  documentType: string;

  checkbox: boolean;
  upfile: File;
  labels: any[];
  isPublished = false; // depends on tags; see below

  isFeatured = false;
  secureHitCount = 0;
  publicHitCount = 0;
  sortOrder = 0;

  read: Array<string> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.project = obj && obj.project || null;
    this.notificationProject = obj && obj.notificationProject || null;

    this.documentFileName = obj && obj.documentFileName || null;
    this.internalOriginalName = obj && obj.internalOriginalName || null;
    this.internalURL = obj && obj.internalURL || null;
    this.passedAVCheck = obj && obj.passedAVCheck || null;
    this.internalMime = obj && obj.internalMime || null;
    this.internalSize = obj && obj.internalSize || null;
    this.documentSource = obj && obj.documentSource || null;

    this.displayName = obj && obj.displayName || null;
    this.milestone = obj && obj.milestone || null;
    this.dateUploaded = obj && obj.dateUploaded ? new Date(obj.dateUploaded) : null;
    this.dateUpdated = obj && obj.dateUpdated ? new Date(obj.dateUpdated) : null;
    this.datePosted = obj && obj.datePosted ? new Date(obj.datePosted) : null;
    this.type = obj && (obj.type || obj.documentType) || null;
    this.documentType = obj && obj.documentType || null;
    this.description = obj && obj.description || null;
    this.documentAuthor = obj && obj.documentAuthor || null;
    this.documentAuthorType = obj && obj.documentAuthorType || null;
    this.eaoStatus = obj && obj.eaoStatus || null;
    this.projectPhase = obj && obj.projectPhase || null;
    this.legislation = obj && obj.legislation || null;
    this.extractionMethod = obj && obj.extractionMethod || null;
    this.contentExtractedAt = obj && obj.contentExtractedAt ? new Date(obj.contentExtractedAt) : null;

    this.checkbox = obj && obj.checkbox || null;
    this.upfile = obj && obj.upfile || null;
    this.labels = obj && obj.labels || null;

    this.read = obj && obj.read || null;

    this.isFeatured = obj && obj.isFeatured || null;
    this.sortOrder = obj && obj.sortOrder || null;
    this.publicHitCount = obj && obj.publicHitCount || null;
    this.secureHitCount = obj && obj.secureHitCount || null;
  }
}
