export class NotificationProject {
  _id: string;
  name: String;
  type: String;
  subType: String;
  proponentName: String;
  startDate: Date;
  decisionDate: Date;
  region: String;
  notificationDecision: String;
  description: String;
  centroid: any[] = [];

  read: Array<String> = [];

  constructor(obj?: any) {
    this._id = obj && obj._id || undefined;
    this.name = obj && obj.name || undefined;
    this.type = obj && obj.type || undefined;
    this.subType = obj && obj.subType || undefined;
    this.proponentName = obj && obj.proponentName || undefined;
    this.startDate = obj && obj.startDate || undefined;
    this.decisionDate = obj && obj.decisionDate || undefined;
    this.region = obj && obj.region || undefined;
    this.notificationDecision = obj && obj.notificationDecision || undefined;
    this.description = obj && obj.description || undefined;
    this.centroid = obj && obj.centroid || undefined;

    this.read = obj && obj.read || undefined;
  }
}
