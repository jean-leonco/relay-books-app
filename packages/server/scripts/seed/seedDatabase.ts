/* eslint-disable no-console */
import yargs from 'yargs';

import { connectDatabase } from '../../src/database';
import { IBook } from '../../src/modules/book/BookModel';

import createBooks from './createBook';
import createCategories from './createCategories';
import createReadingsAndReviews from './createReadingAndReview';
import createUsers, { createUser } from './createUser';

const runScript = async ({ bookCount, userCount }) => {
  console.log(`⏳ Seeding...\n`);

  let readingCount = 0;

  const jeanUser = await createUser({
    name: 'Jean',
    surname: 'Leonco',
    password: '123456',
    email: { email: 'jean@booksapp.com', wasVerified: true },
  }).save();
  console.log('👤 Jean user created\n');

  const categories = await createCategories();

  let books: IBook[] = [];

  for (let i = 0; i < categories.length; i++) {
    books = await createBooks({ bookCount, category: categories[i] });
  }

  const jeanReadingCount = await createReadingsAndReviews({ books, user: jeanUser });
  readingCount += jeanReadingCount;

  const users = await createUsers({ userCount });

  for (let i = 0; i < users.length; i++) {
    const userReadingCount = await createReadingsAndReviews({ books, user: users[i] });
    readingCount += userReadingCount;
  }

  console.log(`🏷️  ${categories.length} categories created\n`);
  console.log(`📚 ${bookCount * categories.length} books created\n`);
  console.log(`👥 ${userCount} users created\n`);
  console.log(`📖 ${readingCount} readings created\n`);
};

const run = async () => {
  const yarg = yargs(process.argv.slice(2));

  const argv = yarg.usage('Database Seed').options({
    books: {
      description: 'The amount of books to be generated per category.',
      alias: 'b',
      default: 10,
    },
    users: {
      description: 'The amount of users to be generated.',
      alias: 'u',
      default: 1000,
    },
  }).argv;

  await connectDatabase();

  await runScript({ bookCount: argv.books, userCount: argv.users });
  process.exit(0);
};

(async () => {
  await run();
})();
