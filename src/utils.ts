
export function encodeBasicAuth(usernameOrEmail: string, password: string) {
  return btoa(`${usernameOrEmail}:${password}`)
}