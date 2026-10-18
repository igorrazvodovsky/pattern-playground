/** An error from a backend API call, carrying the HTTP status when there was one. */
export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}
