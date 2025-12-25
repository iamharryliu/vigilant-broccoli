import { NextRequest, NextResponse } from 'next/server';
import { RecipeScraperService } from '@vigilant-broccoli/ai-tools';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  const recipeTemplate = readFileSync(
    resolve(process.cwd(), '../../../../../notes/cooking/recipe-template.md'),
    'utf-8',
  );
  const measurementConventions = readFileSync(
    resolve(
      process.cwd(),
      '../../../../../notes/cooking/measurement-conventions.md',
    ),
    'utf-8',
  );

  const recipe = await RecipeScraperService.scrapeRecipeFromUrl(
    url,
    recipeTemplate,
    measurementConventions,
  );

  const safeFilename =
    recipe.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.md';

  return new NextResponse(recipe.markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${safeFilename}"`,
    },
  });
}
