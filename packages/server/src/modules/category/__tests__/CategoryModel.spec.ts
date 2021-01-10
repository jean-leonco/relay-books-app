import { connectMongoose, clearDbAndRestartCounters, disconnectMongoose } from '@workspace/test-utils';

import { createCategory } from '../../../test/utils';

import CategoryModel, { ICategory } from '../CategoryModel';

beforeAll(connectMongoose);

beforeEach(clearDbAndRestartCounters);

afterAll(disconnectMongoose);

describe('CategoryModel', () => {
  it('should create new category using CategoryModel', async () => {
    const key = 'science_and_nature';
    const translation = { en: 'science and nature' };

    const category = await new CategoryModel({ key, translation }).save();

    const categoryObj = await CategoryModel.findOne({ _id: category._id }).lean<ICategory>();

    expect(categoryObj?.key).toBe(key);
    expect(categoryObj?.translation).toMatchObject(translation);
  });

  it('should create new category using createRow', async () => {
    const category = await createCategory();

    const categoryObj = await CategoryModel.findOne({ _id: category._id }).lean<ICategory>();

    expect(categoryObj?.key).toBe('category_0');
    expect(categoryObj?.translation).toMatchObject({ en: 'category 0' });
  });

  it('should create new category with custom properties', async () => {
    const translation = { pt: 'science and nature' };

    const category = await createCategory({ translation });

    const categoryObj = await CategoryModel.findOne({ _id: category._id }).lean<ICategory>();

    expect(categoryObj?.translation).toMatchObject(translation);
  });
});
