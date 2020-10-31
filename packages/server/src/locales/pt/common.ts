const common = {
  SomethingWentWrong: 'Algo deu errado.',
  TheDescriptionShouldNot: 'A descrição deve ter menos de {{size}} caracteres.',
};
export default common;
export type Keys = keyof typeof common;
