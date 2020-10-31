import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  createUser,
  createReview,
  createBook,
} from '../../../../test/helpers';

import ReviewModel, { IReview } from '../ReviewModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('ReviewModel', () => {
  it('should create new review using ReviewModel', async () => {
    const user = await createUser();
    const book = await createBook();
    const rating = 4.5;

    const review = await new ReviewModel({
      userId: user._id,
      bookId: book._id,
      rating,
    }).save();

    const reviewObj = await ReviewModel.findOne({ _id: review._id }).lean<IReview>();

    expect(reviewObj?.userId).toMatchObject(user._id);
    expect(reviewObj?.bookId).toMatchObject(book._id);
    expect(reviewObj?.rating).toBe(rating);
  });

  it('should create new review using createRow', async () => {
    const user = await createUser();
    const book = await createBook();

    const review = await createReview();

    const reviewObj = await ReviewModel.findOne({ _id: review._id }).lean<IReview>();

    expect(reviewObj?.userId).toMatchObject(user._id);
    expect(reviewObj?.bookId).toMatchObject(book._id);
    expect(reviewObj?.rating).toBe(1);
  });

  it('should create new review with custom properties', async () => {
    const user = await createUser();
    const book = await createBook();
    const rating = 4.5;

    const review = await createReview({ userId: user._id, bookId: book._id, rating });

    const reviewObj = await ReviewModel.findOne({ _id: review._id }).lean<IReview>();

    expect(reviewObj?.userId).toMatchObject(user._id);
    expect(reviewObj?.bookId).toMatchObject(book._id);
    expect(reviewObj?.rating).toBe(rating);
  });
});
