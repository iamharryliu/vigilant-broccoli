import { INPUT_MAX_LENGTH } from '../consts/data.consts';

export function validateInput(input: string): string {
  const trimmed = (input || '').trim();
  return trimmed.substring(0, INPUT_MAX_LENGTH);
}
