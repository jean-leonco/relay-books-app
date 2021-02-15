import faker from 'faker';

import UserModel, { IUser } from '../../src/modules/user/UserModel';

const createUsers = async ({ userCount }: { userCount: number }) => {
  const users: IUser[] = [];

  for (let i = 0; i < userCount; i++) {
    const user = createUser({});
    users.push(user);
  }

  const data = UserModel.insertMany(users);

  return data;
};

export const createUser = (args: Partial<IUser>) => {
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
  });
};

export default createUsers;
