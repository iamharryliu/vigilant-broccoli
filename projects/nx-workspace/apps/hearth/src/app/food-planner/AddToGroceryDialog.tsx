'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
  Text,
  Dialog,
  DialogContent,
  DialogTitle,
  cn,
} from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { Recipe } from './recipes.types';

const GROCERY_ENDPOINT = '/api/grocery';
const EXTRACT_ENDPOINT = '/api/food-planner/extract-ingredients';

type IngredientItem = {
  text: string;
  haveIt: boolean;
};

type Props = {
  recipe: Recipe | null;
  onClose: () => void;
  onAdded: () => void;
};

export function AddToGroceryDialog({ recipe, onClose, onAdded }: Props) {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const jsonHeaders = () => ({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  useEffect(() => {
    if (!recipe) return;
    setIngredients([]);
    setExtracting(true);
    fetch(EXTRACT_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdowns: [recipe.markdown] }),
    })
      .then(res => res.json())
      .then(({ ingredients: extracted }) =>
        setIngredients(
          (Array.isArray(extracted) ? extracted : []).map((text: string) => ({
            text,
            haveIt: false,
          })),
        ),
      )
      .finally(() => setExtracting(false));
  }, [recipe, token]);

  const toggleHaveIt = (index: number) =>
    setIngredients(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, haveIt: !item.haveIt } : item,
      ),
    );

  const addCount = ingredients.filter(item => !item.haveIt).length;

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
    onClose();
  };

  return (
    <Dialog
      open={recipe !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        showCloseButton={false}
        className={cn(
          'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
          FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
        )}
        style={{ maxWidth: 480 }}
      >
        <DialogTitle className="mb-3 text-xl font-bold leading-7 tracking-normal">
          Add to Grocery List
        </DialogTitle>
        <Text size="2" color="gray" as="p" mb="3">
          Check anything you already have — the rest are added to your grocery
          list.
        </Text>

        {extracting ? (
          <Text size="2" color="gray">
            Extracting ingredients…
          </Text>
        ) : ingredients.length === 0 ? (
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
                  onCheckedChange={() => toggleHaveIt(index)}
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

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={addCount === 0 || saving || extracting}
          >
            {saving ? 'Adding…' : `Add ${addCount} to Grocery List`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
