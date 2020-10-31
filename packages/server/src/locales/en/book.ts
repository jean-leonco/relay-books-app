const book = {
  TheBookIdIsInvalid: 'The book id is invalid.',
  BookNotFound: 'Book not found.',
  BookRemovedWithSuccess: 'Book removed with success.',
  CurrentPageShouldNotBeLargerThan: 'Current page should not be larger than the number of pages in the book.',
};
export default book;
export type Keys = keyof typeof book;
