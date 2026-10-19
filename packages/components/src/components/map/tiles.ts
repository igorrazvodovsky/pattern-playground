/**
 * The base map every location map in the project draws on: CARTO's light
 * tiles over OpenStreetMap data. Kept apart from map.ts so that a map built
 * outside pp-map can use the same tiles without importing the element and
 * its stylesheet.
 */
export const CARTO_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
export const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
