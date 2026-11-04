/** A native DEMI contact row (`GET <DEMI_API_PATH>/users`). `id` is the Eagle User `_id`, or a UUID for a contact made in DEMI. */
export interface User {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  displayName: string;
  salutation: string;
  title: string;
  department: string;
  /** DEMI organization `id`: the Eagle Organization `_id`, or a UUID for an organization made in DEMI. */
  org: string | null;
  orgName: string;
  email: string;
  phoneNumber: string;
  cellPhoneNumber: string;
  faxNumber: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  notes: string;
  /** Set by the admin tables when a row is ticked; never sent by DEMI. */
  checkbox?: boolean;
}

/** Fields DEMI sorts `/users` by; the contact list column values use the same names. `email` and `phoneNumber` need a staff bearer, which admin always sends. */
export const USER_SORT_KEYS = ['displayName', 'orgName', 'email', 'phoneNumber'];

/** The only organization whose contacts DEMI lets be public. */
export const PUBLIC_ORG_NAME = 'Environmental Assessment Office';

/** The fields DEMI's `POST /users` and `PUT /users/:id` take besides `isPublished`; any other key is a 400. */
const WRITABLE_FIELDS = [
  'firstName', 'middleName', 'lastName', 'displayName', 'email', 'org', 'orgName', 'title',
  'phoneNumber', 'salutation', 'department', 'faxNumber', 'cellPhoneNumber', 'address1',
  'address2', 'city', 'province', 'country', 'postalCode', 'notes'
] as const;

export type UserWriteFields = Partial<Pick<User, typeof WRITABLE_FIELDS[number]>>;

/**
 * DEMI write body: the writable fields `input` holds, plus `isPublished`. A PUT replaces every field,
 * so send the whole contact. Public follows the organization, as eagle-api's read rule did.
 */
export function toDemiUserBody(input: UserWriteFields): Record<string, unknown> {
  const body: Record<string, unknown> = Object.fromEntries(
    WRITABLE_FIELDS.filter(field => field in input).map(field => [field, input[field]])
  );
  body['isPublished'] = input.orgName === PUBLIC_ORG_NAME;
  return body;
}

/** One spreadsheet row of the contact export on the group screens. */
export function contactExportRow(user: User) {
  return {
    name: `${user.firstName} ${user.lastName}`,
    title: user.title,
    organization: user.orgName,
    phone: user.phoneNumber,
    address: [user.address1, user.address2].filter(Boolean).join(' '),
    city: user.city,
    province: user.province,
    postal: user.postalCode,
    email: user.email
  };
}
