const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL?.replace(":3000", ":4000") ??
  "http://localhost:4000";

export function apiUrl(path: string) {
  return `${apiBaseUrl}/api/v1${path}`;
}
