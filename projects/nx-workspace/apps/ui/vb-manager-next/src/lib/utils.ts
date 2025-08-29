export function getBasename(filepath: string, suffix = '') {
  // Get the last part after slash
  const fullName = filepath.split('/').pop() as string;
  // Remove the suffix/extension if provided
  return suffix && fullName.endsWith(suffix)
    ? fullName.slice(0, -suffix.length)
    : fullName;
}
