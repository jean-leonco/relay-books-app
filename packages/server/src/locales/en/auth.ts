const auth = {
  InvalidSession: 'Invalid session.',
  InvalidSessionDetailed: 'Invalid session token. It was not found or inactivated or blocked.',
  InvalidSessionScope: 'Invalid session token. Scope mismatch.',
  TokenAuthHeader: 'Authorization header is invalid.',
  TokenAuthHeaderMissingJwt: 'Authorization header does not begin with JWT.',
  TokenExpired: 'Token expired.',
  TokenExpiredDetailed: 'Token expired at {{expired}}.',
  TokenInvalid: 'Invalid token.',
  TokenInvalidSession: 'Token has invalid session.',
  TokenInvalidSignature: 'Token has invalid signature.',
  TokenUnknownError: 'Unknown error related to token.',
  UserDeactivated: 'User found but has been deactivated.',
  UserInvalidCredentials: 'Invalid credentials.',
  UserNotFound: 'User not found.',
  TheEmailMustBeAValidEmail: 'The email must be a valid email.',
  TheEmailIsAlreadyAssociated: 'The email is already associated with another account.',
  PasswordMustBeAtLeast: 'Password must be at least 6 characters.',
  Unauthorized: 'Unauthorized',
};
export default auth;
export type Keys = keyof typeof auth;
