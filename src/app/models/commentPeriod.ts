import { DateTime } from 'luxon';

export class CommentPeriod {
  _id: string;
  _schemaName: string;
  addedBy: string;
  additionalText: string;
  ceaaAdditionalText: string;
  ceaaInformationLabel: string;
  ceaaRelatedDocuments: string;
  classificationRoles: string;
  classifiedPercent: number;
  commenterRoles: string;
  commentTip: string;
  dateAdded: Date;
  dateCompleted: Date;
  dateCompletedEst: Date;
  dateStarted: Date;
  dateStartedEst: Date;
  dateUpdated: Date;
  downloadRoles: string;
  informationLabel: string;
  instructions: string;
  isClassified: boolean;
  isMet: boolean;
  isPublished: boolean;
  isResolved: boolean;
  isVetted: string;
  metURLAdmin: string;
  milestone: string;
  openCommentPeriod: string;
  openHouses: Array<any>;
  periodType: string;
  phase: string;
  phaseName: string;
  project: string;
  publishedPercent: number;
  rangeOption: string;
  rangeType: string;
  relatedDocuments: Array<string>;
  resolvedPercent: number;
  updatedBy: string;
  userCan: string;
  vettedPercent: number;
  vettingRoles: string;

  // Attached
  summary: any;

  // Permissions
  read: Array<string> = [];
  write: Array<string> = [];
  delete: Array<string> = [];

  // Not from API
  commentPeriodStatus: string;
  daysRemaining: string;
  currentPage: number;
  pageSize: number;
  totalComments: number;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this._schemaName = obj && obj._schemaName || null;
    this.addedBy = obj && obj.addedBy || null;
    this.additionalText = obj && obj.additionalText || null;
    this.ceaaAdditionalText = obj && obj.ceaaAdditionalText || null;
    this.ceaaInformationLabel = obj && obj.ceaaInformationLabel || null;
    this.ceaaRelatedDocuments = obj && obj.ceaaRelatedDocuments || null;
    this.classificationRoles = obj && obj.classificationRoles || null;
    this.classifiedPercent = obj && obj.classifiedPercent || null;
    this.commenterRoles = obj && obj.commenterRoles || null;
    this.commentTip = obj && obj.commentTip || null;
    this.dateCompletedEst = obj && obj.dateCompletedEst || null;
    this.dateStartedEst = obj && obj.dateStartedEst || null;
    this.dateUpdated = obj && obj.dateUpdated || null;
    this.downloadRoles = obj && obj.downloadRoles || null;
    this.informationLabel = obj && obj.informationLabel || null;
    this.instructions = obj && obj.instructions || null;
    this.isClassified = obj?.isClassified ?? null;
    this.isMet = obj?.isMet ?? null;
    this.isPublished = obj?.isPublished ?? null;
    this.isResolved = obj?.isResolved ?? null;
    this.isVetted = obj?.isVetted ?? null;
    this.metURLAdmin = obj && obj.metURLAdmin || null;
    this.milestone = obj && obj.milestone || null;
    this.openHouses = obj && obj.openHouses || null;
    this.periodType = obj && obj.periodType || null;
    this.phase = obj && obj.phase || null;
    this.phaseName = obj && obj.phaseName || null;
    this.project = obj && obj.project || null;
    this.publishedPercent = obj && obj.publishedPercent || null;
    this.rangeOption = obj && obj.rangeOption || null;
    this.rangeType = obj && obj.rangeType || null;
    this.relatedDocuments = obj && obj.relatedDocuments || null;
    this.resolvedPercent = obj && obj.resolvedPercent || null;
    this.updatedBy = obj && obj.updatedBy || null;
    this.userCan = obj && obj.userCan || null;
    this.vettedPercent = obj && obj.vettedPercent || null;
    this.vettingRoles = obj && obj.vettingRoles || null;
    this.summary = obj && obj.summary || null;

    this.read = obj && obj.read || null;
    this.write = obj && obj.write || null;
    this.delete = obj && obj.delete || null;

    this.currentPage = obj && obj.currentPage || null;
    this.pageSize = obj && obj.pageSize || null;
    this.totalComments = obj && obj.totalComments || null;

    if (obj && obj.dateAdded) {
      this.dateAdded = new Date(obj.dateAdded);
    }

    if (obj && obj.dateStarted) {
      this.dateStarted = new Date(obj.dateStarted);
    }

    if (obj && obj.dateUpdated) {
      this.dateUpdated = new Date(obj.dateUpdated);
    }

    if (obj && obj.dateCompleted) {
      this.dateCompleted = new Date(obj.dateCompleted);
    }

    // get comment period days remaining and determine commentPeriodStatus of the period
    if (obj && obj.dateStarted && obj.dateCompleted) {
      const now = DateTime.now().setZone('America/Vancouver');
      const dateStarted = DateTime.fromJSDate(new Date(obj.dateStarted)).setZone('America/Vancouver');
      // When dateCompleted is midnight (admin picked a date with no time), treat the period
      // as closing at end of that day (11:59:59 PM Pacific) to satisfy "open until 11:59 PM" requirement.
      const rawEnd = DateTime.fromJSDate(new Date(obj.dateCompleted)).setZone('America/Vancouver');
      const dateCompleted = (rawEnd.hour === 0 && rawEnd.minute === 0 && rawEnd.second === 0)
        ? rawEnd.endOf('day')
        : rawEnd;

      if (now < dateStarted) {
        this.commentPeriodStatus = 'Pending';
        this.daysRemaining = 'Pending';
      } else if (now >= dateStarted && now <= dateCompleted) {
        this.commentPeriodStatus = 'Open';
        const daysRemainingCount = Math.floor(dateCompleted.diff(now, 'days').days);
        this.daysRemaining = daysRemainingCount === 0 ? 'Final Day' : daysRemainingCount + (daysRemainingCount === 1 ? ' Day ' : ' Days ') + 'Remaining';
      } else if (now > dateCompleted) {
        this.commentPeriodStatus = 'Closed';
        this.daysRemaining = 'Completed';
      } else {
        this.commentPeriodStatus = 'None';
        this.daysRemaining = 'None';
      }
    }

    if (obj && obj.read) {
      this.isPublished = obj.read.includes('public');
    }
  }
}
