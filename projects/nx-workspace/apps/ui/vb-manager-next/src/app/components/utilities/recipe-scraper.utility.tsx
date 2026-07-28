'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';
import { Button } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { authFetch } from '../../../../libs/auth';
import { useRecipeScraperInputs } from '../../hooks/useRecipeScraperInputs';
import { RecipeScraperInputs } from '../llm/RecipeScraperInputs';

const MESSAGE_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const RecipeScraperUtilityContent = () => {
  const inputs = useRecipeScraperInputs();
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<{
    type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
    text: string;
  } | null>(null);

  const handleScrapeRecipe = async () => {
    if (!inputs.hasAnyInput) {
      setRecipeMessage({
        type: MESSAGE_TYPE.ERROR,
        text: 'Enter a URL, paste recipe text, or select an image',
      });
      return;
    }

    setRecipeLoading(true);
    setRecipeMessage(null);

    const response = await authFetch(API_ENDPOINTS.RECIPE_SCRAPE, {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      },
      body: JSON.stringify(inputs.requestBody),
    });

    if (!response.ok) {
      const data = await response.json();
      setRecipeMessage({
        type: MESSAGE_TYPE.ERROR,
        text: data.error || 'Failed to scrape recipe',
      });
      setRecipeLoading(false);
      return;
    }
    inputs.reset();
    setRecipeMessage({
      type: MESSAGE_TYPE.SUCCESS,
      text: 'Recipe downloaded successfully!',
    });
    setRecipeLoading(false);
  };

  const handleRecipeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !recipeLoading) {
      handleScrapeRecipe();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <RecipeScraperInputs
          inputs={inputs}
          loading={recipeLoading}
          onUrlKeyDown={handleRecipeKeyDown}
        />

        <Button
          onClick={handleScrapeRecipe}
          disabled={recipeLoading || !inputs.hasAnyInput}
          className="self-end"
        >
          {recipeLoading ? 'Scraping...' : 'Download'}
        </Button>
      </div>

      {recipeMessage && (
        <Text
          size="2"
          color={recipeMessage.type === MESSAGE_TYPE.SUCCESS ? 'green' : 'red'}
        >
          {recipeMessage.text}
        </Text>
      )}
    </>
  );
};
