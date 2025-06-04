export class APIError extends Error {
  public status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}