const auth = {
  InvalidSession: 'Sessão inválida.',
  InvalidSessionDetailed: 'Token de sessão inválido. Não foi encontrado, ou foi desativado, ou foi bloqueado.',
  InvalidSessionScope: 'Token de sessão inválido. Escopos não batem.',
  TokenAuthHeader: 'Cabeçalho Authorization é inválido.',
  TokenAuthHeaderMissingJwt: 'Cabeçalho Authorization não começa com JWT.',
  TokenExpired: 'Token expirado.',
  TokenExpiredDetailed: 'Token expirado em {{expired}}.',
  TokenInvalid: 'Token inválido.',
  TokenInvalidSession: 'Token tem uma sessão inválida.',
  TokenInvalidSignature: 'Token tem uma assinatura inválida.',
  TokenUnknownError: 'Erro desconhecido relacionado ao token.',
  UserDeactivated: 'Usuário encontrado mas foi desativado.',
  UserInvalidCredentials: 'Credenciais inválidas.',
  UserNotFound: 'Usuário não encontrado.',
  TheEmailMustBeAValidEmail: 'O e-mail deve ser um e-mail válido.',
  TheEmailIsAlreadyAssociated: 'O e-mail já está associado a outra conta.',
  PasswordMustBeAtLeast: 'A senha deve ter no mínimo 6 caracteres.',
  Unauthorized: 'Não autorizado',
};
export default auth;
export type Keys = keyof typeof auth;
