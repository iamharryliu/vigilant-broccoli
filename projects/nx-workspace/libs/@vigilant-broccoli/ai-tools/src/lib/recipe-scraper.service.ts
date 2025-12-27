import { LLMService } from './llm.service';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import axios from 'axios';

export interface RecipeMarkdown {
  title: string;
  markdown: string;
}

const extractCleanContent = (html: string): string => {
  let text = html;

  text = text.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    '',
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  text = text.replace(
    /<(nav|footer|header|iframe|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  );

  text = text.replace(/<!--[\s\S]*?-->/g, '');

  text = text.replace(/<[^>]+>/g, ' ');

  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ');

  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return text;
};

const scrapeRecipeFromUrl = async (
  url: string,
  recipeTemplate: string,
  languageCode = 'en-US',
): Promise<RecipeMarkdown> => {
  const response = await axios.get(url);
  const htmlContent = response.data;

  const cleanContent = extractCleanContent(htmlContent);
  const result = await LLMService.prompt<string>({
    prompt: {
      userPrompt: `
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
- Use **bold text** for important steps or ingredients
  - Example: **at room temperature or in the fridge**
- Group ingredients by section if the recipe has them (e.g., "Tofu", "Sauce", "Marinade")
- Include a separate garnish/finishing section if the recipe has garnishes or finishing touches
- Output the recipe in the language specified by the language code: ${languageCode}
- Return ONLY the markdown content, no additional commentary
- Make the instructions list concise and not verbose.

Extract the recipe from this text content and format it as markdown. The original URL is: ${url}

Text Content:
${cleanContent}`,
    },
    modelConfig: {
      model: LLM_MODEL.GPT_4O_MINI,
    },
  });

  const markdown = result.data as string;
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled Recipe';

  return {
    title,
    markdown,
  };
};

export const RecipeScraperService = {
  scrapeRecipeFromUrl,
};
