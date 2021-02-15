import CategoryModel from '../../src/modules/category/CategoryModel';

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

const createCategories = async () => {
  return CategoryModel.insertMany(categories);
};

export default createCategories;
