import { Document, Model } from 'mongoose';

export const getOrCreate = async <Type extends Document>(
  model: Model<Type>,
  createFn: (...args: any[]) => Promise<Type>,
) => {
  const data = await model.findOne().lean();

  if (data) {
    return data;
  }

  return createFn();
};
