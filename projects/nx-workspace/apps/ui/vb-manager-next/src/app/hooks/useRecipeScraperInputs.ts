import { useState } from 'react';
import { UploadedImage, readImageAsBase64 } from '../utils/image-upload.utils';

const buildScrapeRequestBody = (
  recipeUrl: string,
  recipeText: string,
  image: UploadedImage | null,
) => {
  if (image) return { images: [image] };
  if (recipeText.trim()) return { text: recipeText };
  return { url: recipeUrl };
};

export const useRecipeScraperInputs = () => {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipeText, setRecipeText] = useState('');
  const [image, setImage] = useState<UploadedImage | null>(null);

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

  const reset = () => {
    setRecipeUrl('');
    setRecipeText('');
    setImage(null);
  };

  return {
    recipeUrl,
    recipeText,
    image,
    hasUrl,
    hasText,
    hasImage,
    hasAnyInput,
    handleFileSelect,
    clearImage,
    handleUrlChange,
    handleTextChange,
    reset,
    requestBody: buildScrapeRequestBody(recipeUrl, recipeText, image),
  };
};
