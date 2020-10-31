const book = {
  TheBookIdIsInvalid: 'O ID do livro é inválido.',
  BookNotFound: 'Livro não encontrado.',
  BookRemovedWithSuccess: 'Livro removido com sucesso.',
  CurrentPageShouldNotBeLargerThan: 'A página atual não deve ser maior que o quantidade de páginas do livro.',
};
export default book;
export type Keys = keyof typeof book;
