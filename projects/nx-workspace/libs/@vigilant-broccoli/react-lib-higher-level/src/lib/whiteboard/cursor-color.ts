const CURSOR_HUE_SATURATION = 70;
const CURSOR_HUE_LIGHTNESS = 45;
const CURSOR_HASH_MULTIPLIER = 31;
const CURSOR_HASH_MODULO = 360;

export const cursorColor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * CURSOR_HASH_MULTIPLIER + userId.charCodeAt(i)) | 0;
  }
  const hue = Math.abs(hash) % CURSOR_HASH_MODULO;
  return `hsl(${hue}, ${CURSOR_HUE_SATURATION}%, ${CURSOR_HUE_LIGHTNESS}%)`;
};
