import { FastifyPluginAsync } from 'fastify';
import { LLM_MODEL, HTTP_STATUS_CODES } from '@vigilant-broccoli/common-js';
import { callLlm } from '../libs/llm-service.client';

type RecipeImage = { name: string; base64: string; mimeType: string };

type ScrapeRequest = {
  url?: string;
  text?: string;
  images?: RecipeImage[];
  languageCode?: string;
};

const DEFAULT_LANGUAGE_CODE = 'en-US';
const UNTITLED_RECIPE = 'Untitled Recipe';
const NO_RECIPE_FOUND = 'NO_RECIPE_FOUND';
const MIN_CLEAN_CONTENT_LENGTH = 200;

const ERROR_NO_INPUT = 'Provide a url, pasted text, or at least one image';
const ERROR_URL_NOT_ALLOWED = 'This URL cannot be fetched';
const ERROR_FETCH_FAILED = (url: string) => `Could not reach ${url}`;
const ERROR_PAGE_NOT_OK = (res: Response) =>
  `Page returned ${res.status} ${res.statusText} - the site may be blocking automated requests`;
const ERROR_UNREADABLE_PAGE =
  'The page could not be read as a recipe (it may be behind a bot/cookie check or blocked the request)';
const ERROR_NO_RECIPE_FOUND = 'No recipe could be found';

const ALLOWED_URL_PROTOCOLS = ['http:', 'https:'];
const PRIVATE_HOSTNAME_SUFFIXES = ['.local', '.internal'];
const BLOCKED_HOSTNAMES = ['localhost', 'metadata.google.internal'];

const isPrivateIpv4 = (hostname: string): boolean => {
  const parts = hostname.split('.').map(Number);
  if (parts.length !== 4 || parts.some(part => Number.isNaN(part))) {
    return false;
  }
  const [a, b] = parts;
  const singleOctetMatch = [127, 10, 0].includes(a);
  const linkLocalMatch = a === 169 && b === 254;
  const class16Match = a === 172 && b >= 16 && b <= 31;
  const class24Match = a === 192 && b === 168;
  return singleOctetMatch || linkLocalMatch || class16Match || class24Match;
};

const isAllowedUrl = (url: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) return false;

  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(hostname)) return false;
  if (PRIVATE_HOSTNAME_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    return false;
  }
  if (hostname === '[::1]' || hostname.startsWith('[fe80:')) return false;
  if (isPrivateIpv4(hostname)) return false;

  return true;
};

const BOT_CHALLENGE_MARKERS = [
  'just a moment',
  'enable javascript and cookies to continue',
  'checking if the site connection is secure',
  'attention required! | cloudflare',
  'verify you are human',
  'access denied',
];

const RECIPE_TEMPLATE = `# [Recipe Name]

## Ingredients

- [Main ingredient category] (optional grouping)
  - [Ingredient with quantity]
  - [Ingredient with quantity]
- [Another ingredient category] (optional grouping)
  - [Ingredient with quantity]
  - [Ingredient with quantity]
- [Individual ingredients without grouping]

[Garnish/Finishing section if applicable]:

- [Garnish item]
- [Garnish item]

## Instructions

- [Step 1]
- [Step 2]
- [Step 3]
- [Continue with each step as a bullet point]
- [Final step]

## References

- [Link text](RECIPE_URL)
- [Another reference, ie YouTube if applicable](VIDEO_URL)`;

const SKIPPED_CONTENT_TAGS = new Set([
  'script',
  'style',
  'nav',
  'footer',
  'header',
  'iframe',
  'noscript',
  'svg',
]);

const HTML_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  apos: "'",
};

const decodeEntity = (entity: string): string => {
  const body = entity.slice(1, -1);
  return HTML_ENTITIES[body.toLowerCase()] ?? ' ';
};

// Finds the index right after the next literal `</tagName ... >` sequence, searching raw
// text (not tag-aware) since content inside script/style bodies isn't markup.
const findCloseTagEnd = (
  html: string,
  tagName: string,
  from: number,
): number => {
  const closer = new RegExp(`</${tagName}[^>]*>`, 'i');
  const match = closer.exec(html.slice(from));
  return match ? from + match.index + match[0].length : html.length;
};

// Consumes one tag starting at `i` (html[i] === '<'), returning the next scan index and
// any text to append (a space for a normal tag, nothing for a skipped-content tag).
const consumeTag = (
  html: string,
  i: number,
): { nextIndex: number; append: string } => {
  const tagEnd = html.indexOf('>', i);
  if (tagEnd === -1) return { nextIndex: html.length, append: '' };

  const tagContent = html.slice(i + 1, tagEnd);
  const tagName = tagContent
    .match(/^\/?\s*([a-z][a-z0-9]*)/i)?.[1]
    ?.toLowerCase();
  const isClosing = tagContent.trimStart().startsWith('/');

  if (!isClosing && tagName && SKIPPED_CONTENT_TAGS.has(tagName)) {
    return {
      nextIndex: findCloseTagEnd(html, tagName, tagEnd + 1),
      append: '',
    };
  }
  return { nextIndex: tagEnd + 1, append: ' ' };
};

// Single left-to-right scan, not regex matching of open/close pairs, so malformed/nested markup can't defeat it.
const extractCleanContent = (html: string): string => {
  let output = '';
  let i = 0;

  while (i < html.length) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      i = end === -1 ? html.length : end + 3;
      continue;
    }

    if (html[i] === '<') {
      const { nextIndex, append } = consumeTag(html, i);
      output += append;
      i = nextIndex;
      continue;
    }

    if (html[i] === '&') {
      const entityMatch = html.slice(i, i + 12).match(/^&#?[a-z0-9]+;/i);
      if (entityMatch) {
        output += decodeEntity(entityMatch[0]);
        i += entityMatch[0].length;
        continue;
      }
    }

    output += html[i];
    i += 1;
  }

  return output
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

const looksLikeBotChallenge = (cleanContent: string): boolean => {
  const lowerContent = cleanContent.toLowerCase();
  return BOT_CHALLENGE_MARKERS.some(marker => lowerContent.includes(marker));
};

const buildRecipePrompt = (
  sourceDescription: string,
  languageCode: string,
  textContent?: string,
) => `
You are a recipe extraction assistant. Your job is to extract recipe information from the provided content and format it into clean, structured markdown.

The markdown should follow this exact template format:
${RECIPE_TEMPLATE}

Important guidelines:
- Only use ingredients, quantities, and steps that literally appear in the provided content. Never invent, guess, "improve," or add ingredients/steps/references that are not present, even if they are common for this type of dish.
- If the content is empty, garbled, a bot/cookie/JavaScript challenge page, an error page, or otherwise does not contain an actual recipe, respond with exactly the text ${NO_RECIPE_FOUND} and nothing else.
- Only include a reference link (e.g. a YouTube video) in the References section if its URL literally appears in the content — never fabricate one.
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

Extract the recipe from ${sourceDescription}.${
  textContent
    ? `

Text Content:
${textContent}`
    : ''
}`;

const scrapeUrl = async (
  url: string,
): Promise<{
  content?: string;
  error?: { status: number; message: string };
}> => {
  if (!isAllowedUrl(url)) {
    return {
      error: {
        status: HTTP_STATUS_CODES.BAD_REQUEST,
        message: ERROR_URL_NOT_ALLOWED,
      },
    };
  }

  let pageResponse: Response;
  try {
    pageResponse = await fetch(url);
  } catch {
    return {
      error: {
        status: HTTP_STATUS_CODES.BAD_GATEWAY,
        message: ERROR_FETCH_FAILED(url),
      },
    };
  }

  if (!pageResponse.ok) {
    return {
      error: {
        status: HTTP_STATUS_CODES.BAD_GATEWAY,
        message: ERROR_PAGE_NOT_OK(pageResponse),
      },
    };
  }

  const cleanContent = extractCleanContent(await pageResponse.text());

  if (
    cleanContent.length < MIN_CLEAN_CONTENT_LENGTH ||
    looksLikeBotChallenge(cleanContent)
  ) {
    return {
      error: {
        status: HTTP_STATUS_CODES.BAD_GATEWAY,
        message: ERROR_UNREADABLE_PAGE,
      },
    };
  }

  return { content: cleanContent };
};

const recipeRoutes: FastifyPluginAsync = async app => {
  app.post('/scrape', async (req, reply) => {
    const { url, text, images, languageCode } = req.body as ScrapeRequest;
    const trimmedUrl = url?.trim();
    const trimmedText = text?.trim();
    const hasImages = !!images && images.length > 0;

    if (!trimmedUrl && !trimmedText && !hasImages) {
      return reply
        .code(HTTP_STATUS_CODES.BAD_REQUEST)
        .send({ error: ERROR_NO_INPUT });
    }

    let textContent: string | undefined;
    let sourceDescription: string;

    if (trimmedUrl) {
      const { content, error } = await scrapeUrl(trimmedUrl);
      if (error) {
        return reply.code(error.status).send({ error: error.message });
      }
      textContent = content;
      sourceDescription = `this text content. The original URL is: ${trimmedUrl}`;
    } else if (trimmedText) {
      textContent = trimmedText;
      sourceDescription = 'this text content';
    } else {
      sourceDescription = 'the attached image(s)';
    }

    const userPrompt = buildRecipePrompt(
      sourceDescription,
      languageCode ?? DEFAULT_LANGUAGE_CODE,
      textContent,
    );

    const { outputs } = await callLlm<{ outputs: string[] }>({
      userPrompt,
      images,
      model: LLM_MODEL.GPT_4O_MINI,
    });

    const markdown = outputs[0];

    if (markdown.trim() === NO_RECIPE_FOUND) {
      return reply
        .code(HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY)
        .send({ error: ERROR_NO_RECIPE_FOUND });
    }

    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : UNTITLED_RECIPE;

    return { title, markdown };
  });
};

export default recipeRoutes;
