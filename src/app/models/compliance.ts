import * as _ from 'lodash';

export class Compliance {
  _id: string;
  name: string;
  project: string;
  startDate: Date;
  endDate: Date;
  email: boolean;
  case: string;
  label: string;
  elements: any[];

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.project = obj && obj.project || null;

    this.name = obj && obj.name || null;
    this.startDate = obj && obj.startDate || null;
    this.endDate = obj && obj.endDate || null;
    this.email = obj && obj.email || null;
    this.case = obj && obj.case || null;
    this.label = obj && obj.label || null;
    this.elements = obj && obj.elements || null;
  }
}
