import type { WordCategory, WordEntry } from '../types/game';
import { GROUP_A_WORDS, type RichWordTuple } from './categories/groupA';
import { GROUP_B_WORDS } from './categories/groupB';
import { GROUP_C_WORDS } from './categories/groupC';
import { GROUP_D_WORDS } from './categories/groupD';

export const ALL_CATEGORIES: WordCategory[] = [
  'Technology',
  'Electronics',
  'Animals',
  'Birds',
  'Countries',
  'Cities',
  'Travel',
  'Transportation',
  'Food',
  'Fruits',
  'Vegetables',
  'Drinks',
  'Sports',
  'Nature',
  'Science',
  'Space',
  'Professions',
  'Education',
  'Entertainment',
  'Movies',
  'Business',
  'Clothing',
  'Musical Instruments',
  'Household Objects',
  'Buildings',
  'Everyday Objects',
];

export const CATEGORY_HINT_LABEL: Record<WordCategory, string> = {
  Technology: 'Technology',
  Electronics: 'Electronics',
  Animals: 'Animal',
  Birds: 'Bird',
  Countries: 'Country',
  Cities: 'City',
  Travel: 'Travel',
  Transportation: 'Transportation',
  Food: 'Food',
  Fruits: 'Fruit',
  Vegetables: 'Vegetable',
  Drinks: 'Drink',
  Sports: 'Sports',
  Nature: 'Nature',
  Science: 'Science',
  Space: 'Space',
  Professions: 'Profession',
  Education: 'Education',
  Entertainment: 'Entertainment',
  Movies: 'Movie',
  Business: 'Business',
  Clothing: 'Clothing',
  'Musical Instruments': 'Musical Instrument',
  'Household Objects': 'Household Objects',
  Buildings: 'Building',
  'Everyday Objects': 'Everyday Objects',
};

const RAW_WORD_DATA: Record<WordCategory, RichWordTuple[]> = {
  ...GROUP_A_WORDS,
  ...GROUP_B_WORDS,
  ...GROUP_C_WORDS,
  ...GROUP_D_WORDS,
} as Record<WordCategory, RichWordTuple[]>;

const CATEGORY_PREFIX: Record<WordCategory, string> = {
  Technology: 'tec',
  Electronics: 'ele',
  Animals: 'ani',
  Birds: 'bir',
  Countries: 'cou',
  Cities: 'cit',
  Travel: 'trv',
  Transportation: 'tra',
  Food: 'foo',
  Fruits: 'fru',
  Vegetables: 'veg',
  Drinks: 'dri',
  Sports: 'spo',
  Nature: 'nat',
  Science: 'sci',
  Space: 'spa',
  Professions: 'pro',
  Education: 'edu',
  Entertainment: 'ent',
  Movies: 'mov',
  Business: 'bus',
  Clothing: 'clo',
  'Musical Instruments': 'mus',
  'Household Objects': 'hou',
  Buildings: 'bui',
  'Everyday Objects': 'eve',
};

export const WORD_LIBRARY: WordEntry[] = ALL_CATEGORIES.flatMap((category) => {
  const prefix = CATEGORY_PREFIX[category];
  const easyHint = CATEGORY_HINT_LABEL[category];
  return RAW_WORD_DATA[category].map(
    ([word, mediumHint, hardHint, difficulty], index) => ({
      id: `${prefix}-${String(index + 1).padStart(2, '0')}`,
      word,
      category,
      hint: easyHint,
      mediumHint,
      hardHint,
      difficulty,
    }),
  );
});
