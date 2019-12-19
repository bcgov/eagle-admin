import { CommentPeriod } from './commentPeriod';
import * as moment from 'moment';

export class Project {
  // the following are retrieved from the API

  // even though _id is not saved in the db anymore (its on rootlevel project, represented as fullProject on the frontend)
  // this field is still used for saving the project
  _id: string;
  CEAAInvolvement: String;
  CELead: String;
  CELeadEmail: String;
  CELeadPhone: String;
  centroid: any[] = [];
  description: String;
  eacDecision: String;
  location: String;
  legislation: string;
  legislationYear: number;
  name: String;
  projectLeadObj: any;
  projectLeadId: String;
  projectLead: String;
  projectLeadEmail: String;
  projectLeadPhone: String;
  proponent: any;
  region: String;
  responsibleEPDObj: any;
  responsibleEPDId: String;
  responsibleEPD: String;
  responsibleEPDEmail: String;
  responsibleEPDPhone: String;
  type: String;

  // Everything else
  addedBy: String;
  build: String;
  nature: String;
  CEAALink: String;
  code: String;
  commodity: String;
  commentPeriods: CommentPeriod[];
  currentPhaseName: string;
  dateAdded: String;
  dateUpdated: String;
  decisionDate: String;
  duration: String;
  // TODO: directoryStructure
  eaoMember: String;
  epicProjectID: Number;
  fedElecDist: String;
  // TODO: intake
  intake: {
    investment: any;
    investmentNotes: any;
  };
  isTermsAgreed: Boolean;
  overallProgress: Number;
  primaryContact: String;
  proMember: String;
  provElecDist: String;
  sector: String;
  shortName: String;
  status: String;
  substitution: Boolean;
  updatedBy: String;

  eaDecision: any;
  operational: any;

  // TODO: New Stuff?
  eaStatus: any;
  eaStatusDate: String;
  projectStatusDate: String;
  substantiallyDate: String;
  substantially: any;
  dispute: any;
  disputeDate: String;
  activeDate: String;
  activeStatus: any;

  // Project contacts
  projLead: any;
  execProjectDirector: any;
  complianceLead: any;

  // Tracking
  review180Start: any;
  review45Start: any;
  reviewSuspensions: any;
  reviewExtensions: any;

  // Permissions
  read: Array<String> = [];
  write: Array<String> = [];
  delete: Array<String> = [];

  pins: any[] = [];

  // Not from API directly
  currentPeriods: CommentPeriod[];
  commentPeriodForBanner: any;

  isMatches = true;
  isVisible = true;
  isLoaded = false;

  constructor(obj?: any) {
    this._id                 = obj && obj._id                 || null;
    this.CEAAInvolvement     = obj && obj.CEAAInvolvement     || undefined;
    this.CELead              = obj && obj.CELead              || undefined;
    this.CELeadEmail         = obj && obj.CELeadEmail         || undefined;
    this.CELeadPhone         = obj && obj.CELeadPhone         || undefined;
    this.commentPeriodForBanner         = obj && obj.commentPeriodForBanner         || undefined;
    this.description         = obj && obj.description         || undefined;
    this.eacDecision         = obj && obj.eacDecision         || undefined;
    this.location            = obj && obj.location            || undefined;
    this.name                = obj && obj.name                || undefined;
    this.projectLeadObj         = obj && obj.projectLeadObj         || undefined;
    this.projectLeadId         = obj && obj.projectLeadId         || undefined;
    this.projectLead         = obj && obj.projectLead         || undefined;
    this.projectLeadEmail    = obj && obj.projectLeadEmail    || undefined;
    this.projectLeadPhone    = obj && obj.projectLeadPhone    || undefined;
    this.proponent           = obj && obj.proponent           || undefined;
    this.region              = obj && obj.region              || undefined;
    this.responsibleEPDObj      = obj && obj.responsibleEPDObj      || undefined;
    this.responsibleEPDId      = obj && obj.responsibleEPDId      || undefined;
    this.responsibleEPD      = obj && obj.responsibleEPD      || undefined;
    this.responsibleEPDEmail = obj && obj.responsibleEPDEmail || undefined;
    this.responsibleEPDPhone = obj && obj.responsibleEPDPhone || undefined;
    this.type                = obj && obj.type                || undefined;
    this.addedBy             = obj && obj.addedBy             || undefined;
    this.intake              = obj && obj.intake              || undefined;
    this.build               = obj && obj.build               || undefined;
    this.nature               = obj && obj.nature               || undefined;    // readonly view on build
    this.activeStatus = obj && obj.activeStatus || undefined;

    this.eaDecision           = obj && obj.eaDecision               || undefined;
    this.operational          = obj && obj.operational               || undefined;

    this.eaStatusDate               = obj && obj.eaStatusDate               || undefined;
    this.eaStatus               = obj && obj.eaStatus               || undefined;
    this.projectStatusDate               = obj && obj.projectStatusDate               || undefined;
    this.substantiallyDate               = obj && obj.substantiallyDate               || undefined;
    this.substantially               = obj && obj.substantially               || undefined;
    this.disputeDate               = obj && obj.disputeDate               || undefined;
    this.dispute               = obj && obj.dispute               || undefined;
    this.activeDate               = obj && obj.activeDate               || undefined;


    this.CEAALink            = obj && obj.CEAALink            || undefined;
    this.code                = obj && obj.code                || undefined;
    this.commodity           = obj && obj.commodity           || undefined;
    this.currentPhaseName    = obj && obj.currentPhaseName    || undefined;
    this.dateAdded           = obj && obj.dateAdded           || undefined;
    this.dateUpdated         = obj && obj.dateUpdated         || undefined;
    this.decisionDate        = obj && obj.decisionDate        || undefined;
    this.duration            = obj && obj.duration            || undefined;
    this.eaoMember           = obj && obj.eaoMember           || undefined;
    this.epicProjectID       = obj && obj.epicProjectID       || undefined;
    this.fedElecDist         = obj && obj.fedElecDist         || undefined;
    this.isTermsAgreed       = obj && obj.isTermsAgreed       || undefined;
    this.overallProgress     = obj && obj.overallProgress     || undefined;
    this.primaryContact      = obj && obj.primaryContact      || undefined;
    this.proMember           = obj && obj.proMember           || undefined;
    this.provElecDist        = obj && obj.provElecDist        || undefined;
    this.sector              = obj && obj.sector              || undefined;
    this.shortName           = obj && obj.shortName           || undefined;
    this.status              = obj && obj.status              || undefined;
    this.substitution        = obj && obj.substitution        || undefined;
    this.updatedBy           = obj && obj.updatedBy           || undefined;

    this.review180Start      = obj && obj.review180Start      || undefined;
    this.review45Start       = obj && obj.review45Start       || undefined;
    this.reviewSuspensions   = obj && obj.reviewSuspensions   || undefined;
    this.reviewExtensions    = obj && obj.reviewExtensions    || undefined;

    this.read                = obj && obj.read                || undefined;
    this.write               = obj && obj.write               || undefined;
    this.delete              = obj && obj.delete              || undefined;

    this.projLead            = obj && obj.projLead              || undefined;
    this.execProjectDirector = obj && obj.execProjectDirector   || undefined;
    this.complianceLead      = obj && obj.complianceLead        || undefined;
    this.legislation         = obj && obj.legislation         || undefined;
    this.legislationYear     = obj && obj.legislationYear     || undefined;

    // if (obj && obj.publishDate) {
    //   this.publishDate = new Date(obj.publishDate);
    // }

    // // replace \\n (JSON format) with newlines
    // if (obj && obj.description) {
    //   this.description = obj.description.replace(/\\n/g, '\n');
    // }
    // if (obj && obj.legalDescription) {
    //   this.legalDescription = obj.legalDescription.replace(/\\n/g, '\n');
    // }
    // copy pins
    if (obj && obj.pins) {
      obj.pins.forEach(pin => {
        this.pins.push(pin);
      });
    }

    // copy centroid
    if (obj && obj.centroid) {
      obj.centroid.forEach(num => {
        this.centroid.push(num);
      });
    }

    if (obj && obj.currentPeriods) {
      this.commentPeriods.push(obj.currentPeriods);

      let now = moment('YYYY-MM-DD');

      this.commentPeriods.forEach(period => {
        // TODO: Update comment period model. Should actually be period.dateEnded or something.
        if (moment(period.dateCompleted) > now) {
          this.currentPeriods.push(obj.currentPeriods);
        }
      });
    }

    // if (obj && obj.decision) {
    //   this.decision = new Decision(obj.decision);
    // }

    // // copy documents
    // if (obj && obj.documents) {
    //   for (const doc of obj.documents) {
    //     this.documents.push(doc);
    //   }
    // }

    // // copy features
    // if (obj && obj.features) {
    //   for (const feature of obj.features) {
    //     this.features.push(feature);
    //   }
    // }
  }
}

export enum ProjectPublishState {
  published2002 = 2002,
  published2018 = 2018,
  unpublished = 1 // non-falsey value that won't be mistaken for a year
}
