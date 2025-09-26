// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache: Record<string, ReturnType<T>> = {};
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache[key]) return cache[key];
    const result = fn(...args);
    cache[key] = result;
    return result;
  }) as T;
};

export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export function getEnvironmentVariable(key: string) {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not set.`);
    return '';
  }
  return value;
}
