import faker from 'faker';

import UserModel, { IUser } from '../../src/modules/user/UserModel';

const createUser = async (args: Partial<IUser>) => {
  const name = args.name || faker.name.firstName();
  const surname = args.surname || faker.name.lastName();
  const password = args.password || faker.internet.password();
  const email = args.email || { email: `${name}.${surname}@workspace.com`, wasVerified: true };

  return new UserModel({
    name,
    surname,
    password,
    email,
    ...args,
  }).save();
};

export default createUser;
