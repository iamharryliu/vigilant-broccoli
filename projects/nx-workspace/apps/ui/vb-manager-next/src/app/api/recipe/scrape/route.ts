import { NextRequest, NextResponse } from 'next/server';
import { RecipeScraperService } from '@vigilant-broccoli/ai-tools';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { open } from '@vigilant-broccoli/common-node';
import { OPEN_TYPE } from '@vigilant-broccoli/common-js';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  const recipeTemplate = readFileSync(
    resolve(process.cwd(), '../../../../../notes/cooking/recipe-template.md'),
    'utf-8',
  );

  const recipe = await RecipeScraperService.scrapeRecipeFromUrl(
    url,
    recipeTemplate,
  );

  const safeFilename =
    recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.md';

  // Ensure the sort-later directory exists
  const sortLaterDir = resolve(
    process.cwd(),
    '../../../../../notes/cooking/recipes/sort-later',
  );
  mkdirSync(sortLaterDir, { recursive: true });

  // Write the recipe to the sort-later directory
  const filePath = resolve(sortLaterDir, safeFilename);
  writeFileSync(filePath, recipe.markdown, 'utf-8');

  await open(OPEN_TYPE.VSCODE, filePath);

  return NextResponse.json(
    {
      message: 'Recipe saved successfully',
      filename: safeFilename,
    },
    { status: 200 },
  );
}
