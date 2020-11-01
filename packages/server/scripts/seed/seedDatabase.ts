/* eslint-disable no-console */

import connectDatabase from '../../src/common/database';

import { IBook } from '../../src/models';

import createUser from './createUser';
import createCategory from './createCategory';
import createBook from './createBook';
import createReadingAndReview from './createReadingAndReview';

const categories = [
  'Science and Nature',
  'Comedy',
  'Drama',
  'Sports',
  'Science fiction and fantasy',
  'History',
  'Mystery',
  'For kids',
  'Romance',
  'Horror',
];

const runScript = async () => {
  console.log(`⏳ Seeding...\n`);

  const books = 10; // 100 books
  const users = 500; // 5000 users
  let unfinishedReadings = 0;
  let finishedReadings = 0;

  const jeanUser = await createUser({
    name: 'Jean',
    surname: 'Leonco',
    password: '123456',
    email: { email: 'jean@booksapp.com', wasVerified: true },
  });
  console.log('👤 Jean user created\n');

  for (let i = 0; i < categories.length; i++) {
    const name = categories[i];
    const category = await createCategory({ name });

    const bookArr: IBook[] = [];

    for (let i = 0; i < books; i++) {
      const book = await createBook({ categoryId: category._id });
      bookArr.push(book);
    }

    for (let i = 0; i < bookArr.length; i++) {
      const book = bookArr[i];

      const readingAndReview = await createReadingAndReview({ book, user: jeanUser });

      if (readingAndReview && readingAndReview.finished) {
        finishedReadings += 1;
      } else if (readingAndReview && !readingAndReview.finished) {
        unfinishedReadings += 1;
      }
    }

    for (let i = 0; i < users; i++) {
      const user = await createUser({});

      for (let j = 0; j < bookArr.length; j++) {
        const book = bookArr[j];

        const readingAndReview = await createReadingAndReview({ book, user });

        if (readingAndReview && readingAndReview.finished) {
          finishedReadings += 1;
        } else if (readingAndReview && !readingAndReview.finished) {
          unfinishedReadings += 1;
        }
      }
    }
  }

  console.log(`🏷️  ${categories.length} categories created\n`);
  console.log(`📚 ${books * categories.length} books created\n`);
  console.log(`👥 ${users * categories.length} users created\n`);
  console.log(`📕 ${finishedReadings} finished readings created\n`);
  console.log(`📖 ${unfinishedReadings} unfinished readings created\n`);
};

(async () => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('❌ Could not connect to database');
    process.exit(1);
  }

  try {
    await runScript();
    console.log('✔️  Database seed completed');
  } catch (err) {
    console.log('err:', err);
    process.exit(1);
  }
  process.exit(0);
})();
