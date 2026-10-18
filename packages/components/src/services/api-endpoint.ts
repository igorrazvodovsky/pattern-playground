/**
 * Resolve an API path (e.g. `/api/explain`) against the backend for the
 * current environment: the local Express server in development, the
 * `VITE_API_URL` origin when set, the same origin otherwise.
 */
export function apiEndpoint(path: string): string {
  if (
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ) {
    return `http://localhost:3000${path}`;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return `${apiUrl}${path}`;

  return path;
}
