import { NextRequest, NextResponse } from 'next/server';
import { RecipeScraperService } from '@vigilant-broccoli/ai-tools';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  const recipe = await RecipeScraperService.scrapeRecipeFromUrl(url);

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
