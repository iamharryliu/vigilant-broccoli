import { twMerge } from 'tailwind-merge';

type ClassValue = string | number | boolean | null | undefined | ClassValue[];

function clsx(...args: ClassValue[]): string {
  return args
    .flat(Infinity as 0)
    .filter(Boolean)
    .join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
