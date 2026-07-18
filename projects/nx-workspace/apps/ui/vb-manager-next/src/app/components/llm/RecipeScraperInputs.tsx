'use client';
import { Text } from '@radix-ui/themes';
import { Button, Input, Textarea } from '@vigilant-broccoli/react-lib';
import { useRecipeScraperInputs } from '../../hooks/useRecipeScraperInputs';

type RecipeScraperInputsProps = {
  inputs: ReturnType<typeof useRecipeScraperInputs>;
  loading: boolean;
  onUrlKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const RecipeScraperInputs = ({
  inputs,
  loading,
  onUrlKeyDown,
}: RecipeScraperInputsProps) => {
  const {
    recipeUrl,
    recipeText,
    image,
    hasUrl,
    hasText,
    hasImage,
    handleUrlChange,
    handleTextChange,
    handleFileSelect,
    clearImage,
  } = inputs;

  return (
    <>
      <Input
        placeholder="Enter recipe URL..."
        value={recipeUrl}
        onChange={handleUrlChange}
        onKeyDown={onUrlKeyDown}
        disabled={loading || hasImage || hasText}
      />

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
    </>
  );
};
