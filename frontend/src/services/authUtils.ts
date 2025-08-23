export function getUserFromToken(token: string) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    const id = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
    return { id, name, email };
  } catch {
    return null;
  }
}
