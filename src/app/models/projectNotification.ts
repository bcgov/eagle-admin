export class ProjectNotification {
  _id: string;
  name: string;
  type: string;
  subType: string;
  proponent: string;
  nature: string;
  region: string;
  location: string;
  decision: string;
  decisionDate: Date;
  notificationReceivedDate: Date;
  description: string;
  notificationThresholdValue: string;
  notificationThresholdUnits: string;
  centroid: Array<string>;
  trigger: string;
  associatedProjectId: string;
  associatedProjectName: string;
  read: Array<string> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || undefined;
    this.name = obj && obj.name || undefined;
    this.type = obj && obj.type || undefined;
    this.subType = obj && obj.subType || undefined;
    this.proponent = obj && obj.proponent || undefined;
    this.nature = obj && obj.nature || undefined;
    this.region = obj && obj.region || undefined;
    this.location = obj && obj.location || undefined;
    this.decision = obj && obj.decision || undefined;
    this.decisionDate = obj && obj.decisionDate || undefined;
    this.notificationReceivedDate = obj && obj.notificationReceivedDate || undefined;
    this.description = obj && obj.description || undefined;
    this.notificationThresholdValue = obj && obj.notificationThresholdValue || undefined;
    this.notificationThresholdUnits = obj && obj.notificationThresholdUnits || undefined;
    this.trigger = obj && obj.trigger || undefined;
    this.centroid = obj && obj.centroid || undefined;
    this.associatedProjectId = obj && obj.associatedProjectId || undefined;
    this.associatedProjectName = obj && obj.associatedProjectName || undefined;
    this.read = obj && obj.read || undefined;
  }
}
