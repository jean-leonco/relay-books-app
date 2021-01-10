/* eslint-disable no-console */

import { connectDatabase } from '../../src/database';

import { IBook } from '../../src/modules/book/BookModel';

import createUser from './createUser';
import createCategory from './createCategory';
import createBook from './createBook';
import createReadingAndReview from './createReadingAndReview';

const categories = [
  {
    key: 'science_and_nature',
    translation: {
      en: 'Science and Nature',
      pt: 'Ciência e Natureza',
    },
  },
  {
    key: 'comedy',
    translation: {
      en: 'Comedy',
      pt: 'Comédia',
    },
  },
  {
    key: 'drama',
    translation: {
      en: 'Drama',
      pt: 'Drama',
    },
  },
  {
    key: 'sports',
    translation: {
      en: 'Sports',
      pt: 'Esportes',
    },
  },
  {
    key: 'science_fiction_and_fantasy',
    translation: {
      en: 'Science fiction and fantasy',
      pt: 'Ficção científica e fantasia',
    },
  },
  {
    key: 'history',
    translation: {
      en: 'History',
      pt: 'História',
    },
  },
  {
    key: 'mystery',
    translation: {
      en: 'Mystery',
      pt: 'Mistério',
    },
  },
  {
    key: 'for_kids',
    translation: {
      en: 'For kids',
      pt: 'Para crianças',
    },
  },
  {
    key: 'romance',
    translation: {
      en: 'Romance',
      pt: 'Romance',
    },
  },
  {
    key: 'horror',
    translation: {
      en: 'Horror',
      pt: 'Terror',
    },
  },
];

const runScript = async () => {
  console.log(`⏳ Seeding...\n`);

  // @TODO - add dynamic way to choose this values
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
    const category = await createCategory({ ...categories[i] });

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
