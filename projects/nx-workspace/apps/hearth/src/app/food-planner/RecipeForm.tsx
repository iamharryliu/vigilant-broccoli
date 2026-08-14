'use client';

import { useState } from 'react';
import {
  Button,
  CRUDFormProps,
  Input,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { MockRecipe } from './recipes.consts';

const SAVE_LABEL = 'Save';
const SAVING_LABEL = 'Saving…';

export function RecipeForm({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<MockRecipe>) {
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [markdown, setMarkdown] = useState(initialFormValues.markdown);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await submitHandler(
        { ...initialFormValues, title, description, markdown },
        formType,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Title
        </Text>
        <Input
          placeholder="e.g. Ginger Pork Stir Fry"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Description
        </Text>
        <Input
          placeholder="Short summary"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          Recipe (markdown)
        </Text>
        <Textarea
          placeholder={'## Ingredients\n- ...\n\n## Method\n1. ...'}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          rows={10}
        />
      </div>
      <Button onClick={handleSubmit} disabled={submitting}>
        {submitting ? SAVING_LABEL : SAVE_LABEL}
      </Button>
    </div>
  );
}
