export function getBasename(filepath: string, suffix = '') {
  const fullName = filepath.split('/').pop() as string;
  return suffix && fullName.endsWith(suffix)
    ? fullName.slice(0, -suffix.length)
    : fullName;
}
