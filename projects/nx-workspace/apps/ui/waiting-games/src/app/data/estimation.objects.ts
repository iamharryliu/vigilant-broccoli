export const ESTIMATION_OBJECT = {
  STAR: { key: 'STAR', glyph: '⭐' },
  APPLE: { key: 'APPLE', glyph: '🍎' },
  BALLOON: { key: 'BALLOON', glyph: '🎈' },
  FISH: { key: 'FISH', glyph: '🐟' },
  FLOWER: { key: 'FLOWER', glyph: '🌼' },
  BUTTERFLY: { key: 'BUTTERFLY', glyph: '🦋' },
  DUCK: { key: 'DUCK', glyph: '🦆' },
  GEM: { key: 'GEM', glyph: '💎' },
} as const;

export type EstimationObjectKind = keyof typeof ESTIMATION_OBJECT;

export const ESTIMATION_OBJECT_KINDS = Object.keys(
  ESTIMATION_OBJECT,
) as EstimationObjectKind[];
