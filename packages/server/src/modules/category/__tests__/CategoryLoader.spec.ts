import {
  clearDbAndRestartCounters,
  connectMongoose,
  disconnectMongoose,
  getContext,
  createCategory,
  createUser,
} from '../../../../test/helpers';

import * as CategoryLoader from '../CategoryLoader';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('CategoryLoader', () => {
  it('should be able to load a category', async () => {
    const user = await createUser();
    const category = await createCategory();

    const context = await getContext({ user });
    const categoryObj = await CategoryLoader.load(context, category._id);

    expect(categoryObj).not.toBe(null);
    expect(categoryObj!.name).toEqual(category.name);
  });

  it('should not be able to load a category without context.user', async () => {
    const category = await createCategory();

    const context = await getContext({});
    const categoryObj = await CategoryLoader.load(context, category._id);

    expect(categoryObj).toBe(null);
  });

  it('should be able to load a list of categories', async () => {
    const user = await createUser();

    for (let i = 0; i < 11; i++) {
      await createCategory();
    }

    const context = await getContext({ user });
    const categoryObj = await CategoryLoader.loadCategories(context, {});

    expect(categoryObj).not.toBe(null);
    expect(categoryObj.count).toBe(11);
  });

  it('should not be able to load a list of categories without context.user', async () => {
    for (let i = 0; i < 11; i++) {
      await createCategory();
    }

    const context = await getContext();
    const categoryObj = await CategoryLoader.loadCategories(context, {});

    expect(categoryObj).not.toBe(null);
    expect(categoryObj.count).toBe(0);
  });
});
