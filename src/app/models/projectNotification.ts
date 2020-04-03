export class ProjectNotification {
  _id: string;
  name: string;
  type: string;
  subType: string;
  nature: string;
  region: string;
  location: string;
  decision: string;
  decisionDate: Date;
  description: string;
  centroid: Array<string>;
  trigger: string;

  read: Array<string> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || undefined;
    this.name = obj && obj.name || undefined;
    this.type = obj && obj.type || undefined;
    this.subType = obj && obj.subType || undefined;
    this.nature = obj && obj.nature || undefined;
    this.region = obj && obj.region || undefined;
    this.location = obj && obj.location || undefined;
    this.decision = obj && obj.decision || undefined;
    this.decisionDate = obj && obj.decisionDate || undefined;
    this.description = obj && obj.description || undefined;
    this.trigger = obj && obj.trigger || undefined;
    this.centroid = obj && obj.centroid || undefined;

    this.read = obj && obj.read || undefined;
  }
}
