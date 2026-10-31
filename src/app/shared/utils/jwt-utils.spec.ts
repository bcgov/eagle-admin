import { JwtUtil } from './jwt-utils';

const HEADER = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

describe('JwtUtil.decodeToken', () => {
  it('decodes a base64url payload that uses the url-safe alphabet', () => {
    // Payload {"preferred_username":"?ab>"}; "?" encodes to "_" and ">" to "-".
    const token = `${HEADER}.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiI_YWI-In0.sig`;

    expect(JwtUtil.decodeToken(token).preferred_username).toBe('?ab>');
  });

  it('decodes non-ASCII payload text as UTF-8', () => {
    // Payload {"name":"Zoë"}
    const token = `${HEADER}.eyJuYW1lIjoiWm_DqyJ9.sig`;

    expect(JwtUtil.decodeToken(token).name).toBe('Zoë');
  });

  it('returns null for a token without three parts', () => {
    expect(JwtUtil.decodeToken(`${HEADER}.eyJzdWIiOiJ4In0`)).toBeNull();
  });

  it('returns null for a payload whose length is not valid base64', () => {
    expect(JwtUtil.decodeToken(`${HEADER}.eyJhY.sig`)).toBeNull();
  });
});
