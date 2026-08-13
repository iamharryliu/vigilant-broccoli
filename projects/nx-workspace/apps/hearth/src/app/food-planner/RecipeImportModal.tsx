'use client';

import { useState } from 'react';
import { Dialog } from '@radix-ui/themes';
import {
  Button,
  Checkbox,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Text,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { MOCK_RECIPES } from './recipes.consts';

const GROCERY_ENDPOINT = '/api/grocery';
const EXTRACT_ENDPOINT = '/api/food-planner/extract-ingredients';

type Step = 'select' | 'review';

type IngredientItem = {
  text: string;
  haveIt: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
};

type SelectStepProps = {
  selectedRecipeIds: Set<string>;
  onToggleRecipe: (id: string) => void;
  onCancel: () => void;
  onExtract: () => void;
  extracting: boolean;
};

function SelectStep({
  selectedRecipeIds,
  onToggleRecipe,
  onCancel,
  onExtract,
  extracting,
}: SelectStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <Text size="2" color="gray">
        Select recipes to pull ingredients from.
      </Text>
      <div className="flex flex-col divide-y divide-[var(--gray-a4)]">
        {MOCK_RECIPES.map(recipe => (
          <label
            key={recipe.id}
            className="flex cursor-pointer items-start gap-3 py-2.5"
          >
            <Checkbox
              className="mt-0.5 h-5 w-5 shrink-0"
              checked={selectedRecipeIds.has(recipe.id)}
              onCheckedChange={() => onToggleRecipe(recipe.id)}
            />
            <div className="flex flex-col">
              <Text size="3" weight="medium">
                {recipe.title}
              </Text>
              <Text size="1" color="gray">
                {recipe.description}
              </Text>
            </div>
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={onExtract}
          disabled={selectedRecipeIds.size === 0 || extracting}
        >
          {extracting ? 'Extracting…' : 'Extract Ingredients'}
        </Button>
      </div>
    </div>
  );
}

type ReviewStepProps = {
  ingredients: IngredientItem[];
  onToggleHaveIt: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  saving: boolean;
  addCount: number;
};

function ReviewStep({
  ingredients,
  onToggleHaveIt,
  onBack,
  onSubmit,
  saving,
  addCount,
}: ReviewStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <Text size="2" color="gray">
        Check anything you already have — the rest are added to your grocery
        list.
      </Text>
      {ingredients.length === 0 ? (
        <Text size="2" color="gray">
          No ingredients found.
        </Text>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--gray-a4)]">
          {ingredients.map((item, index) => (
            <label
              key={`${item.text}-${index}`}
              className="flex cursor-pointer items-center gap-3 py-2"
            >
              <Checkbox
                className="h-5 w-5 shrink-0"
                checked={item.haveIt}
                onCheckedChange={() => onToggleHaveIt(index)}
              />
              <Text
                size="3"
                className={
                  item.haveIt ? 'text-[var(--gray-a9)] line-through' : ''
                }
              >
                {item.text}
              </Text>
            </label>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={addCount === 0 || saving}>
          {saving ? 'Adding…' : `Add ${addCount} to Grocery List`}
        </Button>
      </div>
    </div>
  );
}

export function RecipeImportModal({ open, onOpenChange, onAdded }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  const [step, setStep] = useState<Step>('select');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(
    new Set(),
  );
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const jsonHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  const reset = () => {
    setStep('select');
    setSelectedRecipeIds(new Set());
    setIngredients([]);
    setExtracting(false);
    setSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const toggleRecipe = (id: string) =>
    setSelectedRecipeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleHaveIt = (index: number) =>
    setIngredients(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, haveIt: !item.haveIt } : item,
      ),
    );

  const handleExtract = async () => {
    const markdowns = MOCK_RECIPES.filter(r =>
      selectedRecipeIds.has(r.id),
    ).map(r => r.markdown);
    if (markdowns.length === 0) return;
    setExtracting(true);
    const res = await fetch(EXTRACT_ENDPOINT, {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({ markdowns }),
    });
    const { ingredients: extracted } = await res.json();
    setIngredients(
      (Array.isArray(extracted) ? extracted : []).map((text: string) => ({
        text,
        haveIt: false,
      })),
    );
    setExtracting(false);
    setStep('review');
  };

  const handleSubmit = async () => {
    if (!homeId) return;
    const toAdd = ingredients.filter(item => !item.haveIt);
    setSaving(true);
    await Promise.all(
      toAdd.map(item =>
        fetch(GROCERY_ENDPOINT, {
          method: 'POST',
          headers: jsonHeaders(),
          body: JSON.stringify({ name: item.text, homeId }),
        }),
      ),
    );
    setSaving(false);
    onAdded();
    handleOpenChange(false);
  };

  const addCount = ingredients.filter(item => !item.haveIt).length;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content
        className={FULL_SCREEN_ON_MOBILE_DIALOG_CLASS}
        style={{ maxWidth: 480 }}
      >
        <Dialog.Title>
          {step === 'select' ? 'Import from Recipes' : 'Review Ingredients'}
        </Dialog.Title>

        {step === 'select' ? (
          <SelectStep
            selectedRecipeIds={selectedRecipeIds}
            onToggleRecipe={toggleRecipe}
            onCancel={() => handleOpenChange(false)}
            onExtract={handleExtract}
            extracting={extracting}
          />
        ) : (
          <ReviewStep
            ingredients={ingredients}
            onToggleHaveIt={toggleHaveIt}
            onBack={() => setStep('select')}
            onSubmit={handleSubmit}
            saving={saving}
            addCount={addCount}
          />
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
