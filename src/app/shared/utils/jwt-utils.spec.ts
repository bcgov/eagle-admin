import { JwtUtil } from './jwt-utils';

const HEADER = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9';

describe('JwtUtil.decodeToken', () => {
  it('decodes a base64url payload that uses the url-safe alphabet', () => {
    // Payload {"preferred_username":"jdo?e"}; the "?" encodes to "_".
    const token = `${HEADER}.eyJwcmVmZXJyZWRfdXNlcm5hbWUiOiJqZG8_ZSJ9.sig`;

    expect(JwtUtil.decodeToken(token).preferred_username).toBe('jdo?e');
  });

  it('returns null for a token without three parts', () => {
    expect(JwtUtil.decodeToken(`${HEADER}.eyJzdWIiOiJ4In0`)).toBeNull();
  });

  it('returns null for a payload whose length is not valid base64', () => {
    expect(JwtUtil.decodeToken(`${HEADER}.eyJhY.sig`)).toBeNull();
  });
});
