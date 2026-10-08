export class RecipeApiError extends Error {
  constructor(readonly i18nPath: string) {
    super(i18nPath);
  }
}
