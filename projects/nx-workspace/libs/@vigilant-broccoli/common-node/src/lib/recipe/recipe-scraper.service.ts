import { LLMService } from '@vigilant-broccoli/ai-tools';
import { LLM_MODEL } from '@vigilant-broccoli/common-js';
import axios from 'axios';

export interface RecipeMarkdown {
  title: string;
  markdown: string;
}

// Extract clean text content from HTML, removing scripts, styles, and HTML tags
const extractCleanContent = (html: string): string => {
  let text = html;

  // Remove script and style tags with their content
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove other non-content tags
  text = text.replace(/<(nav|footer|header|iframe|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ');

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .trim();

  return text;
};

// Scrape a recipe from a URL and convert it to markdown format
const scrapeRecipeFromUrl = async (url: string): Promise<RecipeMarkdown> => {
  // Fetch the HTML content from the URL
  const response = await axios.get(url);
  const htmlContent = response.data;

  // Extract clean text content
  const cleanContent = extractCleanContent(htmlContent);

  // Use LLM to extract and format the recipe
  const result = await LLMService.prompt<string>({
    prompt: {
      systemPrompt: `You are a recipe extraction assistant. Your job is to extract recipe information from text content and format it into clean, structured markdown.

The markdown should follow this exact format:

# [Recipe Title]

## Ingredients

- [Ingredient category/section] (if applicable)
  - [Ingredient with quantity]
  - [Ingredient with quantity]
- [Another category] (if applicable)
  - [Ingredient with quantity]

## Instructions

- [Step 1]
- [Step 2]
- [Step 3]

## Reference

- [Recipe]([original URL])

Important guidelines:
1. Extract ALL ingredients with their exact quantities
2. Group ingredients by section if the recipe has them (e.g., "Tofu", "Sauce", "Marinade")
3. Format instructions as clear, actionable bullet points
4. Keep the original recipe's level of detail
5. If there are cooking times, temperatures, or special notes, include them in the instructions
6. Return ONLY the markdown content, no additional commentary`,
      userPrompt: `Extract the recipe from this text content and format it as markdown. The original URL is: ${url}

Text Content:
${cleanContent}`,
    },
    modelConfig: {
      model: LLM_MODEL.GPT_4O_MINI,
      temperature: 0.3,
      max_tokens: 4000,
    },
  });

  // Extract title from the markdown (first # heading)
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
