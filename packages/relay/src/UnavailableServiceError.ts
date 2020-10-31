export default class UnavailableServiceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnavailableServiceError';
  }
}
