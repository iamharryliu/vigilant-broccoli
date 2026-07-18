'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';
import { Button, Input, Textarea } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { authFetch } from '../../../../libs/auth';
import {
  UploadedImage,
  readImageAsBase64,
} from '../../utils/image-upload.utils';

const buildScrapeRequestBody = (
  recipeUrl: string,
  recipeText: string,
  image: UploadedImage | null,
) => {
  if (image) return { images: [image] };
  if (recipeText.trim()) return { text: recipeText };
  return { url: recipeUrl };
};

export const RecipeScraperUtilityContent = () => {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeMessage, setRecipeMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const hasUrl = !!recipeUrl.trim();
  const hasText = !!recipeText.trim();
  const hasImage = !!image;
  const hasAnyInput = hasUrl || hasText || hasImage;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(await readImageAsBase64(file));
    setRecipeUrl('');
    setRecipeText('');
  };

  const clearImage = () => setImage(null);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipeUrl(e.target.value);
    if (e.target.value) setRecipeText('');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRecipeText(e.target.value);
    if (e.target.value) setRecipeUrl('');
  };

  const handleScrapeRecipe = async () => {
    if (!hasAnyInput) {
      setRecipeMessage({
        type: 'error',
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
      body: JSON.stringify(
        buildScrapeRequestBody(recipeUrl, recipeText, image),
      ),
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
    setRecipeText('');
    setImage(null);
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
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Enter recipe URL..."
          value={recipeUrl}
          onChange={handleUrlChange}
          onKeyDown={handleRecipeKeyDown}
          disabled={recipeLoading || hasImage || hasText}
        />

        <Textarea
          placeholder="...or paste recipe text here"
          value={recipeText}
          onChange={handleTextChange}
          disabled={recipeLoading || hasImage || hasUrl}
          rows={6}
        />

        <div className="flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={recipeLoading || hasUrl || hasText}
          />
          {image && (
            <>
              <Text size="2" color="gray">
                {image.name}
              </Text>
              <Button
                onClick={clearImage}
                disabled={recipeLoading}
                variant="outline"
              >
                Clear
              </Button>
            </>
          )}
        </div>

        <Button
          onClick={handleScrapeRecipe}
          disabled={recipeLoading || !hasAnyInput}
          className="self-end"
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
