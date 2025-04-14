import { icons as phosphorIcons } from '@iconify-json/ph';

const iconNames = Object.keys(phosphorIcons.icons);
const excludedSuffixes = ['-thin', '-light', '-bold', '-duotone', '-fill'];

const regularIconNames = iconNames.filter(name =>
  !excludedSuffixes.some(suffix => name.endsWith(suffix))
);

export function getRandomIcon() {
  const randomIndex = Math.floor(Math.random() * regularIconNames.length);
  return "ph:" + regularIconNames[randomIndex];
}

export function getRandomFilledIcon() {
  const filledIconNames = iconNames.filter(name => name.endsWith('-fill'));
  const randomIndex = Math.floor(Math.random() * filledIconNames.length);
  return "ph:" + filledIconNames[randomIndex];
}