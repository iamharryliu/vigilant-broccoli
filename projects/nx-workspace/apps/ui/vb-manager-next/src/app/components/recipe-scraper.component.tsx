'use client';

import { Card, Flex, Text, TextField, Button } from '@radix-ui/themes';
import { useState } from 'react';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export const RecipeScraperComponent = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleScrapeRecipe = async () => {
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await fetch(API_ENDPOINTS.RECIPE_SCRAPE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage({
        type: 'error',
        text: data.error || 'Failed to scrape recipe',
      });
      setLoading(false);
      return;
    }
    setUrl('');
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      handleScrapeRecipe();
    }
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="4" p="4">
        <Text size="5" weight="bold">
          Recipe Scraper
        </Text>

        <Flex direction="column" gap="3">
          <TextField.Root
            placeholder="Enter recipe URL..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            size="3"
          />

          <Button
            onClick={handleScrapeRecipe}
            disabled={loading || !url.trim()}
            size="3"
          >
            {loading ? 'Scraping...' : 'Download Recipe'}
          </Button>

          {message && (
            <Text size="2" color={message.type === 'success' ? 'green' : 'red'}>
              {message.text}
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
