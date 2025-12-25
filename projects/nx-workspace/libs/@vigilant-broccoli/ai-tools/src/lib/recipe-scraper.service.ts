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
  measurementConventions: string,
): Promise<RecipeMarkdown> => {
  const response = await axios.get(url);
  const htmlContent = response.data;

  const cleanContent = extractCleanContent(htmlContent);
  const result = await LLMService.prompt<string>({
    prompt: {
      systemPrompt: `You are a recipe extraction assistant. Your job is to extract recipe information from text content and format it into clean, structured markdown.

The markdown should follow this exact template format:

${recipeTemplate}

Follow these measurement and formatting conventions:

${measurementConventions}

Important guidelines:
1. Extract ALL ingredients with their exact quantities
2. Group ingredients by section if the recipe has them (e.g., "Tofu", "Sauce", "Marinade")
3. Include a separate garnish/finishing section if the recipe has garnishes or finishing touches
4. Format instructions as clear, actionable bullet points
5. Keep the original recipe's level of detail
6. If there are cooking times, temperatures, or special notes, include them in the instructions
7. In the References section, include the original URL
8. Return ONLY the markdown content, no additional commentary`,
      userPrompt: `Extract the recipe from this text content and format it as markdown. The original URL is: ${url}

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
