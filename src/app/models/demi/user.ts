/** A native DEMI contact row (`GET <DEMI_API_PATH>/users`). `id` is the Eagle User `_id`. */
export interface User {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  displayName: string;
  salutation: string;
  title: string;
  department: string;
  /** Eagle Organization id. */
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

/** Fields eagle-api's `PUT user/:id` and `POST user/` read. */
const EAGLE_USER_FIELDS = [
  'firstName', 'middleName', 'lastName', 'displayName', 'email', 'org', 'orgName', 'title',
  'phoneNumber', 'salutation', 'department', 'faxNumber', 'cellPhoneNumber', 'address1',
  'address2', 'city', 'province', 'country', 'postalCode', 'notes'
] as const;

/**
 * Write body for eagle-api. A body with `_id`, or with no `id`, is already Eagle-shaped and is sent unchanged;
 * a native row (`id`, no `_id`) is renamed to `_id` and trimmed to the fields eagle-api reads.
 */
export function toEagleUserBody(input: object): Record<string, unknown> {
  if ('_id' in input || !('id' in input)) {
    return input as Record<string, unknown>;
  }
  const row = input as User;
  const body: Record<string, unknown> = { _id: row.id };
  for (const field of EAGLE_USER_FIELDS) {
    if (field in row) {
      body[field] = row[field];
    }
  }
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
