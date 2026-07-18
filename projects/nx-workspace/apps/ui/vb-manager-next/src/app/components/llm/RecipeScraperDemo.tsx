'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import { Text } from '@radix-ui/themes';
import {
  Button,
  CopyPastable,
  Input,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { authFetch } from '../../../../libs/auth';

type UploadedImage = {
  name: string;
  base64: string;
  mimeType: string;
};

const readImageAsBase64 = (file: File): Promise<UploadedImage> =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      resolve({
        name: file.name,
        base64: dataUrl.split(',')[1],
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  });

const buildScrapeRequestBody = (
  recipeUrl: string,
  recipeText: string,
  image: UploadedImage | null,
) => {
  if (image) return { images: [image] };
  if (recipeText.trim()) return { text: recipeText };
  return { url: recipeUrl };
};

export const RecipeScraperDemo = () => {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    title: string;
    markdown: string;
  } | null>(null);

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
    if (!recipeUrl.trim() && !recipeText.trim() && !image) {
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
      body: JSON.stringify(
        buildScrapeRequestBody(recipeUrl, recipeText, image),
      ),
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

  const hasUrl = !!recipeUrl.trim();
  const hasText = !!recipeText.trim();
  const hasImage = !!image;
  const hasAnyInput = hasUrl || hasText || hasImage;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-end">
        <Input
          placeholder="Enter recipe URL..."
          value={recipeUrl}
          onChange={handleUrlChange}
          onKeyDown={handleRecipeKeyDown}
          disabled={loading || hasImage || hasText}
          className="flex-1"
        />
        <Button onClick={handleScrapeRecipe} disabled={loading || !hasAnyInput}>
          {loading ? 'Scraping...' : 'Scrape'}
        </Button>
      </div>

      <Textarea
        placeholder="...or paste recipe text here"
        value={recipeText}
        onChange={handleTextChange}
        disabled={loading || hasImage || hasUrl}
        rows={6}
      />

      <div className="flex gap-2 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading || hasUrl || hasText}
        />
        {image && (
          <>
            <Text size="2" color="gray">
              {image.name}
            </Text>
            <Button onClick={clearImage} disabled={loading} variant="outline">
              Clear
            </Button>
          </>
        )}
      </div>

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
