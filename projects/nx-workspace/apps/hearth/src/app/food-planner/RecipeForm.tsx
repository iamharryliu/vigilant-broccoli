'use client';

import { useState } from 'react';
import {
  Button,
  Checkbox,
  CRUDFormProps,
  Input,
  Text,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import { useRecipeTranslation } from './useRecipeTranslation';
import { Recipe } from './recipes.types';
import { RecipeTagPicker } from './RecipeTags';
import { RecipeApiError } from './recipe-errors';

const GENERATE_TAGS_INPUT_ID = 'recipe-generate-tags';

export function RecipeForm({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<Recipe>) {
  const t = useRecipeTranslation();
  const [title, setTitle] = useState(initialFormValues.title);
  const [description, setDescription] = useState(initialFormValues.description);
  const [markdown, setMarkdown] = useState(initialFormValues.markdown);
  const [tags, setTags] = useState(initialFormValues.tags);
  const [tagsEdited, setTagsEdited] = useState(false);
  const [generateTags, setGenerateTags] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isCreate = formType === FORM_TYPE.CREATE;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await submitHandler(
        {
          ...initialFormValues,
          title,
          description,
          markdown,
          tags,
          tagsEdited,
          generateTags: isCreate ? generateTags : undefined,
        },
        formType,
      );
    } catch (submitError) {
      setError(
        t(
          submitError instanceof RecipeApiError
            ? submitError.i18nPath
            : 'ERRORS.SAVE_FAILED',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {t('FORM.TITLE')}
        </Text>
        <Input
          placeholder={t('FORM.TITLE_PLACEHOLDER')}
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {t('FORM.DESCRIPTION')}
        </Text>
        <Input
          placeholder={t('FORM.DESCRIPTION_PLACEHOLDER')}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {t('FORM.MARKDOWN')}
        </Text>
        <Textarea
          placeholder={t('FORM.MARKDOWN_PLACEHOLDER')}
          value={markdown}
          onChange={e => setMarkdown(e.target.value)}
          rows={10}
        />
      </div>
      {isCreate ? (
        <label
          htmlFor={GENERATE_TAGS_INPUT_ID}
          className="flex items-center gap-2"
        >
          <Checkbox
            id={GENERATE_TAGS_INPUT_ID}
            checked={generateTags}
            onCheckedChange={checked => setGenerateTags(checked === true)}
          />
          <Text size="2">{t('TAGS.GENERATE_AUTOMATICALLY')}</Text>
        </label>
      ) : (
        <div>
          <Text size="1" weight="medium" as="p" mb="1">
            {t('TAGS.EDIT_HEADING')}
          </Text>
          <RecipeTagPicker
            value={tags}
            onChange={next => {
              setTags(next);
              setTagsEdited(true);
            }}
          />
        </div>
      )}
      {error && (
        <Text size="1" color="red" as="p" role="alert">
          {error}
        </Text>
      )}
      <Button onClick={handleSubmit} disabled={submitting}>
        {t(submitting ? 'FORM.SAVING' : 'FORM.SAVE')}
      </Button>
    </div>
  );
}
