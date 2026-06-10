import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { open } from '@vigilant-broccoli/common-node';
import {
  API_KEY_HEADER,
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
  LLM_MODEL,
  OPEN_TYPE,
} from '@vigilant-broccoli/common-js';
import { VIGILANT_BROCCOLI_ROOT_PATH } from '../../../app.const';

const LLM_SERVICE_URL = process.env['LLM_SERVICE_URL'];
const SHARED_APP_TOKEN = process.env['SHARED_APP_TOKEN'];
const LLM_ENDPOINT = `${LLM_SERVICE_URL}/api/llm`;
const DEFAULT_LANGUAGE_CODE = 'en-US';
const UNTITLED_RECIPE = 'Untitled Recipe';

const extractCleanContent = (html: string): string =>
  html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(
      /<(nav|footer|header|iframe|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi,
      '',
    )
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

const buildRecipePrompt = (
  url: string,
  recipeTemplate: string,
  cleanContent: string,
  languageCode: string,
) => `
You are a recipe extraction assistant. Your job is to extract recipe information from text content and format it into clean, structured markdown.

The markdown should follow this exact template format:
${recipeTemplate}

Important guidelines:
- Prefer metric units over imperial units
- Please convert all volume measurements to the following:
  - **tsp** - teaspoon
  - **tbsp** - tablespoon
  - **ml** - milliliter
  - **mg** - milligram
- Please convert all weight measurements to the following:
  - **g** - gram
  - **kg** - kilogram
- Please convert all temperature measurements to the following:
  - **°C** - Celsius
- Please write units together with number, ie 25g, 30ml, etc..
- Use **bold text** for important steps or ingredients
  - Example: **at room temperature or in the fridge**
- Group ingredients by section if the recipe has them (e.g., "Tofu", "Sauce", "Marinade")
- Include a separate garnish/finishing section if the recipe has garnishes or finishing touches
- Output the recipe in the language specified by the language code: ${languageCode}
- Return ONLY the markdown content, no additional commentary
- Make the instructions list concise and not verbose.

Extract the recipe from this text content and format it as markdown. The original URL is: ${url}

Text Content:
${cleanContent}`;

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  const vbRootPath = VIGILANT_BROCCOLI_ROOT_PATH.replace(
    /^~(?=$|\/|\\)/,
    homedir(),
  );
  const recipeTemplate = readFileSync(
    resolve(vbRootPath, 'notes/hobbies/cooking/recipe-template.md'),
    'utf-8',
  );

  const pageResponse = await fetch(url);
  const cleanContent = extractCleanContent(await pageResponse.text());

  const llmResponse = await fetch(LLM_ENDPOINT, {
    method: HTTP_METHOD.POST,
    headers: {
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
      [API_KEY_HEADER]: SHARED_APP_TOKEN ?? '',
    },
    body: JSON.stringify({
      userPrompt: buildRecipePrompt(
        url,
        recipeTemplate,
        cleanContent,
        DEFAULT_LANGUAGE_CODE,
      ),
      model: LLM_MODEL.GPT_4O_MINI,
    }),
  });

  if (!llmResponse.ok) {
    const text = await llmResponse.text();
    throw new Error(`llm-service ${llmResponse.status}: ${text}`);
  }

  const { outputs } = (await llmResponse.json()) as { outputs: string[] };
  const markdown = outputs[0];
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : UNTITLED_RECIPE;

  const safeFilename =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '.md';

  const sortLaterDir = resolve(
    vbRootPath,
    'notes/hobbies/cooking/recipes/sort-later',
  );
  mkdirSync(sortLaterDir, { recursive: true });

  const filePath = resolve(sortLaterDir, safeFilename);
  writeFileSync(filePath, markdown, 'utf-8');

  await open(OPEN_TYPE.VSCODE, filePath);

  return NextResponse.json(
    {
      message: 'Recipe saved successfully',
      filename: safeFilename,
    },
    { status: 200 },
  );
}
