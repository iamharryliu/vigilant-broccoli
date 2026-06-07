'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';
import { Button, Input } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

export const RecipeScraperUtilityContent = () => {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleScrapeRecipe = async () => {
    if (!recipeUrl.trim()) {
      setRecipeMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setRecipeLoading(true);
    setRecipeMessage(null);

    const response = await fetch(API_ENDPOINTS.RECIPE_SCRAPE, {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      },
      body: JSON.stringify({ url: recipeUrl }),
    });

    if (!response.ok) {
      const data = await response.json();
      setRecipeMessage({
        type: 'error',
        text: data.error || 'Failed to scrape recipe',
      });
      setRecipeLoading(false);
      return;
    }
    setRecipeUrl('');
    setRecipeMessage({
      type: 'success',
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
      <div className="flex gap-2 items-end">
        <Input
          placeholder="Enter recipe URL..."
          value={recipeUrl}
          onChange={e => setRecipeUrl(e.target.value)}
          onKeyDown={handleRecipeKeyDown}
          disabled={recipeLoading}
          className="flex-1"
        />
        <Button
          onClick={handleScrapeRecipe}
          disabled={recipeLoading || !recipeUrl.trim()}
        >
          {recipeLoading ? 'Scraping...' : 'Download'}
        </Button>
      </div>

      {recipeMessage && (
        <Text
          size="2"
          color={recipeMessage.type === 'success' ? 'green' : 'red'}
        >
          {recipeMessage.text}
        </Text>
      )}
    </>
  );
};
