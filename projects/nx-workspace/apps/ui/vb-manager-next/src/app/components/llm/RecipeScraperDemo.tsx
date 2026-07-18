'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';
import { Button, CopyPastable } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { authFetch } from '../../../../libs/auth';
import { useRecipeScraperInputs } from '../../hooks/useRecipeScraperInputs';
import { RecipeScraperInputs } from './RecipeScraperInputs';

export const RecipeScraperDemo = () => {
  const inputs = useRecipeScraperInputs();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    title: string;
    markdown: string;
  } | null>(null);

  const handleScrapeRecipe = async () => {
    if (!inputs.hasAnyInput) {
      setError('Enter a URL, paste recipe text, or select an image');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await authFetch(API_ENDPOINTS.RECIPE_SCRAPE_PREVIEW, {
      method: HTTP_METHOD.POST,
      headers: {
        ...HTTP_HEADERS.CONTENT_TYPE.JSON,
      },
      body: JSON.stringify(inputs.requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to scrape recipe');
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  };

  const handleRecipeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleScrapeRecipe();
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <RecipeScraperInputs
        inputs={inputs}
        loading={loading}
        onUrlKeyDown={handleRecipeKeyDown}
      />

      <Button
        onClick={handleScrapeRecipe}
        disabled={loading || !inputs.hasAnyInput}
        className="self-end"
      >
        {loading ? 'Scraping...' : 'Scrape'}
      </Button>

      {error && (
        <Text size="2" color="red">
          {error}
        </Text>
      )}

      {result && (
        <div className="flex flex-col gap-2">
          <Text size="3" weight="medium">
            {result.title}
          </Text>
          <CopyPastable text={result.markdown} isScrollable />
        </div>
      )}
    </div>
  );
};
