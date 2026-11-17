export interface GraphColorScheme {
  id: string;
  name: string;
  // null keeps the per-group hashed hues.
  colors: readonly string[] | null;
}

export const DEFAULT_GRAPH_COLOR_SCHEME_ID = 'wada-321';

// Four-color combinations from Sanzo Wada's "A Dictionary of Color
// Combinations" (numbered as in the book), via the
// mattdesl/dictionary-of-colour-combinations dataset. Picked for CIELAB
// lightness 40–80 so every swatch reads on both light and dark backgrounds.
export const GRAPH_COLOR_SCHEMES: readonly GraphColorScheme[] = [
  { id: 'hues', name: 'Folder hues', colors: null },
  {
    id: 'wada-252',
    name: 'No. 252',
    colors: ['#da525d', '#bb7125', '#c19f2c', '#099197'],
  },
  {
    id: 'wada-257',
    name: 'No. 257',
    colors: ['#e31f26', '#fcb315', '#006eb8', '#a36aa5'],
  },
  {
    id: 'wada-260',
    name: 'No. 260',
    colors: ['#d46d7a', '#eea78c', '#b4cdc2', '#00b49b'],
  },
  {
    id: 'wada-264',
    name: 'No. 264',
    colors: ['#f8b6ba', '#dd4027', '#b7c2a9', '#0093a5'],
  },
  {
    id: 'wada-274',
    name: 'No. 274',
    colors: ['#f15a30', '#8b835b', '#5a82b3', '#9a72aa'],
  },
  {
    id: 'wada-282',
    name: 'No. 282',
    colors: ['#da525d', '#c59f6b', '#96d1aa', '#b984af'],
  },
  {
    id: 'wada-299',
    name: 'No. 299',
    colors: ['#c53c69', '#eea78c', '#819238', '#007190'],
  },
  {
    id: 'wada-312',
    name: 'No. 312',
    colors: ['#ae5224', '#f99d1b', '#709390', '#005b8d'],
  },
  // Outside the lightness band (Sulpher Yellow is near-white, Deep Slate
  // Olive near-black), so those nodes fade into light/dark backgrounds.
  {
    id: 'wada-321',
    name: 'No. 321',
    colors: ['#b59392', '#f5ecc2', '#253122', '#97acc8'],
  },
  {
    id: 'wada-347',
    name: 'No. 347',
    colors: ['#a6a159', '#00b49b', '#005b8d', '#b984af'],
  },
];

export const findGraphColorScheme = (id: string | null) =>
  GRAPH_COLOR_SCHEMES.find(scheme => scheme.id === id);
