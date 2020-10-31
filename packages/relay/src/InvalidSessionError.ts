export default class InvalidSessionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidSessionError';
  }
}
