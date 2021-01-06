import CategoryModel, { ICategory } from '../../src/modules/category/CategoryModel';

const createCategory = async (args: Partial<ICategory>) => {
  return new CategoryModel(args).save();
};

export default createCategory;
