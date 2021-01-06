import { connectMongoose, clearDbAndRestartCounters, disconnectMongoose } from '@workspace/test-utils';

import { createCategory } from '../../../test/utils';

import CategoryModel, { ICategory } from '../CategoryModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('CategoryModel', () => {
  it('should create new category using CategoryModel', async () => {
    const name = 'science and nature';

    const category = await new CategoryModel({ name }).save();

    const categoryObj = await CategoryModel.findOne({ _id: category._id }).lean<ICategory>();

    expect(categoryObj?.name).toBe(name);
  });

  it('should create new category using createRow', async () => {
    const category = await createCategory();

    const categoryObj = await CategoryModel.findOne({ _id: category._id }).lean<ICategory>();

    expect(categoryObj?.name).toBe('category 0');
  });

  it('should create new category with custom properties', async () => {
    const name = 'science and nature';

    const category = await createCategory({ name });

    const categoryObj = await CategoryModel.findOne({ _id: category._id }).lean<ICategory>();

    expect(categoryObj?.name).toBe(name);
  });
});
