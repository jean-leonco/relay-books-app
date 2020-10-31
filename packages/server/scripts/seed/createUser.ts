import faker from 'faker';

import { DeepPartial } from '@booksapp/types';

import { User, IUser } from '../../src/models';

const createUser = async (args: DeepPartial<IUser>) => {
  const name = args.name || faker.name.firstName();
  const surname = args.surname || faker.name.lastName();
  const password = args.password || faker.internet.password();
  const email = args.email || { email: `${name}.${surname}@booksapp.com`, wasVerified: true };

  return new User({
    name,
    surname,
    password,
    email,
    ...args,
  }).save();
};

export default createUser;
