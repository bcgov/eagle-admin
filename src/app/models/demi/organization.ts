/**
 * A native DEMI `Organization` row (`GET <DEMI_API_PATH>/organizations`). `id` is the Eagle Organization `_id`.
 * Optional fields are staff-side: DEMI leaves them out for a request with no staff credential.
 */
export interface Organization {
  id: string;
  eagleId: string;
  name: string;
  companyType: string;
  province: string;
  country: string;
  address1: string;
  city: string;
  postal: string;
  website: string;
  isPublished: boolean;
  description?: string;
  address2?: string;
  company?: string;
  companyLegal?: string;
  /** Eagle `_id` of the parent organization. */
  parentCompany?: string | null;
  addedBy?: string;
  updatedBy?: string;
  dateAdded?: string | null;
  dateUpdated?: string | null;
}
