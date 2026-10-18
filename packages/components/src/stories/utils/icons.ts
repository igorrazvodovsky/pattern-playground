import { faker } from '@faker-js/faker';
import { icons as phosphorIcons } from '@iconify-json/ph';

// Picks go through faker, so the seed the Storybook preview sets before each
// story makes them repeat from load to load.
const iconNames = Object.keys(phosphorIcons.icons);
const excludedSuffixes = ['-thin', '-light', '-bold', '-duotone', '-fill'];

const regularIconNames = iconNames.filter(name =>
  !excludedSuffixes.some(suffix => name.endsWith(suffix))
);
const filledIconNames = iconNames.filter(name => name.endsWith('-fill'));

export function getRandomIcon() {
  return "ph:" + faker.helpers.arrayElement(regularIconNames);
}

export function getRandomFilledIcon() {
  return "ph:" + faker.helpers.arrayElement(filledIconNames);
}
