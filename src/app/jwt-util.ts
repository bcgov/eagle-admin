export class JwtUtil {
  private urlBase64Decode(str: string) {
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0: { break; }
      case 2: { output += '=='; break; }
      case 3: { output += '='; break; }
      default: {
        return null;
      }
    }
    return decodeURIComponent(encodeURI(window.atob(output)));
  }
  public decodeToken(token: string) {
    if (!token) {
      return null;
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      return null;
    }
    return JSON.parse(decoded);
  }
}
