const review = {
  ReviewNotFound: 'Resenha não encontrada.',
  ReviewRemovedWithSuccess: 'Resenha removida com sucesso.',
  UnableToReviewBookWithoutFinishingIt: 'Não é possível criar uma resenha sem terminar o livro.',
  AReviewForThisBookWasAlreadyCreated: 'Uma resenha para esse livro já foi criada.',
};
export default review;
export type Keys = keyof typeof review;
