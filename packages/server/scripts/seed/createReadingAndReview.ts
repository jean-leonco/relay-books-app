import faker from 'faker';

import { IBook } from '../../src/modules/book/BookModel';
import ReadingModel, { IReading } from '../../src/modules/reading/ReadingModel';
import ReviewModel, { IReview } from '../../src/modules/review/ReviewModel';
import { IUser } from '../../src/modules/user/UserModel';

import createReading from './createReading';
import createReview from './createReview';

const createReadingsAndReviews = async ({ books, user }: { books: IBook[]; user: IUser }) => {
  const readings: IReading[] = [];
  const reviews: IReview[] = [];
  let readingCount = 0;

  for (let j = 0; j < books.length; j++) {
    const book = books[j];

    const readingAndReview = createReadingAndReview({ book, user });

    if (readingAndReview) {
      const { reading, review } = readingAndReview;
      readings.push(reading);

      if (review) {
        reviews.push(review);
      }

      readingCount += 1;
    }
  }

  await ReadingModel.insertMany(readings);
  await ReviewModel.insertMany(reviews);

  return readingCount;
};

interface CreateReadingAndReviewProps {
  book: IBook;
  user: IUser;
}

const createReadingAndReview = ({ book, user }: CreateReadingAndReviewProps) => {
  const shouldReadBook = faker.random.boolean();

  if (!shouldReadBook) {
    return null;
  }

  const shouldFinishBook = faker.random.boolean();
  const shouldReviewBook = faker.random.boolean();

  const reading = createReading({
    bookId: book._id,
    userId: user._id,
    readPages: shouldFinishBook ? book.pages : faker.random.number({ min: 1, max: book.pages - 1 }),
  });

  if (shouldFinishBook) {
    let review: IReview | null = null;

    if (shouldReviewBook) {
      review = createReview({ bookId: book._id, userId: user._id });
    }

    return { reading, review };
  }

  return { reading, review: null };
};

export default createReadingsAndReviews;
