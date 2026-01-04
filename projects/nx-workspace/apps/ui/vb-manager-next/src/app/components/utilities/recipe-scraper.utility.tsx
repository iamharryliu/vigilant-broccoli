'use client';

import { Flex, Text, TextField, Button } from '@radix-ui/themes';
import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import { API_ENDPOINTS } from '../../constants/api-endpoints';

interface RecipeScraperUtilityProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const RecipeScraperUtility = ({ isOpen, setIsOpen }: RecipeScraperUtilityProps) => {
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    setRecipeMessage({ type: 'success', text: 'Recipe downloaded successfully!' });
    setRecipeLoading(false);
  };

  const handleRecipeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !recipeLoading) {
      handleScrapeRecipe();
    }
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-gray-300 dark:border-gray-700 pt-3"
    >
      <Collapsible.Trigger asChild>
        <button
          className="flex items-center justify-between w-full mb-3 group cursor-pointer"
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          <Text size="3" weight="bold">
            Recipe Scraper
          </Text>
          <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
            {isOpen ? '▲' : '▼'}
          </Text>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="flex flex-col gap-3">
        <Flex gap="2" align="end">
          <TextField.Root
            placeholder="Enter recipe URL..."
            value={recipeUrl}
            onChange={e => setRecipeUrl(e.target.value)}
            onKeyDown={handleRecipeKeyDown}
            disabled={recipeLoading}
            size="2"
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleScrapeRecipe}
            disabled={recipeLoading || !recipeUrl.trim()}
            size="2"
          >
            {recipeLoading ? 'Scraping...' : 'Download'}
          </Button>
        </Flex>

        {recipeMessage && (
          <Text size="2" color={recipeMessage.type === 'success' ? 'green' : 'red'}>
            {recipeMessage.text}
          </Text>
        )}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
