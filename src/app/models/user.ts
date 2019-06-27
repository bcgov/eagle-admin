import * as _ from 'lodash';

export class User {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  displayName: string;
  email: string;
  org: any;
  title: string;
  phoneNumber: string;
  salutation: string;
  department: string;
  faxNumber: string;
  cellPhoneNumber: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  notes: string;
  checkbox: boolean;

  constructor(obj?: any) {
    this._id           = obj && obj._id           || undefined;
    this.firstName           = obj && obj.firstName           || undefined;
    this.middleName           = obj && obj.middleName           || undefined;
    this.lastName           = obj && obj.lastName           || undefined;
    this.displayName           = obj && obj.displayName           || undefined;
    this.email           = obj && obj.email           || undefined;
    this.org           = obj && obj.org           || undefined;
    this.title           = obj && obj.title           || undefined;
    this.phoneNumber           = obj && obj.phoneNumber           || undefined;
    this.salutation           = obj && obj.salutation           || undefined;
    this.department           = obj && obj.department           || undefined;
    this.faxNumber           = obj && obj.faxNumber           || undefined;
    this.cellPhoneNumber           = obj && obj.cellPhoneNumber           || undefined;
    this.address1           = obj && obj.address1           || undefined;
    this.address2           = obj && obj.address2           || undefined;
    this.city           = obj && obj.city           || undefined;
    this.province           = obj && obj.province           || undefined;
    this.country           = obj && obj.country           || undefined;
    this.postalCode           = obj && obj.postalCode           || undefined;
    this.notes           = obj && obj.notes           || undefined;
    this.checkbox           = obj && obj.checkbox           || undefined;
  }
}
