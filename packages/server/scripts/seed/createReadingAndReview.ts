import faker from 'faker';

import { IUser, IBook } from '../../src/models';

import createReading from './createReading';
import createReview from './createReview';

interface CreateReadingAndReviewProps {
  book: IBook;
  user: IUser;
}

const createReadingAndReview = async ({ book, user }: CreateReadingAndReviewProps) => {
  const shouldReadBook = faker.random.boolean();

  if (!shouldReadBook) {
    return null;
  }

  const shouldFinishBook = faker.random.boolean();
  const shouldReviewBook = faker.random.boolean();

  await createReading({
    bookId: book._id,
    userId: user._id,
    readPages: shouldFinishBook ? book.pages : faker.random.number({ min: 1, max: book.pages - 1 }),
  });

  if (shouldFinishBook) {
    if (shouldReviewBook) {
      await createReview({ bookId: book._id, userId: user._id });
    }

    return { finished: true };
  } else {
    return { finished: false };
  }
};

export default createReadingAndReview;
