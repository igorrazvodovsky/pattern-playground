import { faker } from '@faker-js/faker';
import collection from '../../icons/iconoteka.generated.json' with { type: 'json' };

// Picks go through faker, so the seed the Storybook preview sets before each
// story makes them repeat from load to load. Only bundled icons can render,
// so the picks come from the collection, not from all of Iconoteka.
const iconNames = Object.keys(collection.icons);

const regularIconNames = iconNames.filter(name => !/-(thin|ultralight|light|medium|semibold|bold|fill)$/.test(name));
const filledIconNames = iconNames.filter(name => name.endsWith('-fill'));

export function getRandomIcon() {
  return `${collection.prefix}:${faker.helpers.arrayElement(regularIconNames)}`;
}

export function getRandomFilledIcon() {
  return `${collection.prefix}:${faker.helpers.arrayElement(filledIconNames)}`;
}
