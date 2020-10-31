import { sanitizeTestObject } from '@booksapp/test-utils';

import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  getContext,
  createReview,
  createUser,
  createBook,
} from '../../../../test/helpers';

import * as ReviewLoader from '../ReviewLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReviewLoader', () => {
  it('should be able to load an review', async () => {
    const user = await createUser();
    const review = await createReview();

    const context = await getContext({ user });
    const reviewObj = await ReviewLoader.load(context, review._id);

    expect(reviewObj).not.toBe(null);
    expect(reviewObj!.bookId).toEqual(review.bookId);
    expect(reviewObj!.rating).toEqual(review.rating);
    expect(reviewObj!.userId).toMatchObject(review.userId);
  });

  it('should not be able to load an review without context.user', async () => {
    const review = await createReview();

    const context = await getContext({});
    const reviewObj = await ReviewLoader.load(context, review._id);

    expect(reviewObj).toBe(null);
  });

  it('should be able to load a list of reviews', async () => {
    const user = await createUser();

    for (let i = 0; i < 11; i++) {
      await createReview();
    }

    const context = await getContext({ user });
    const reviewObj = await ReviewLoader.loadReviews(context, {});

    expect(reviewObj).not.toBe(null);
    expect(reviewObj.count).toBe(11);
    expect(sanitizeTestObject(reviewObj)).toMatchSnapshot();
  });

  it('should not be able to load a list of reviews without context.user', async () => {
    for (let i = 0; i < 11; i++) {
      await createReview();
    }

    const context = await getContext();
    const reviewObj = await ReviewLoader.loadReviews(context, {});

    expect(reviewObj).not.toBe(null);
    expect(reviewObj.count).toBe(0);
  });

  it('should be able to load a book rating', async () => {
    const user = await createUser();
    const book = await createBook();

    let totalRating = 0;
    const totalReviews = 5;

    for (let i = 0; i < totalReviews; i++) {
      const rating = i % 2 === 0 ? 5 : 2;
      await createReview({ rating });
      totalRating += rating;
    }

    const context = await getContext({ user });
    const bookAverage = await ReviewLoader.loadBookAverageRating(context, book._id);

    expect(bookAverage).not.toBe(null);
    expect(bookAverage).toBe(totalRating / totalReviews);
  });

  it('should be able to load a book rating even if there is no review', async () => {
    const user = await createUser();
    const book = await createBook();

    const context = await getContext({ user });
    const bookAverage = await ReviewLoader.loadBookAverageRating(context, book._id);

    expect(bookAverage).not.toBe(null);
    expect(bookAverage).toBe(0);
  });

  it('should not be able to load a book rating without an user', async () => {
    const book = await createBook();

    const context = await getContext();
    const bookAverage = await ReviewLoader.loadBookAverageRating(context, book._id);

    expect(bookAverage).not.toBe(null);
    expect(bookAverage).toBe(0);
  });
});
