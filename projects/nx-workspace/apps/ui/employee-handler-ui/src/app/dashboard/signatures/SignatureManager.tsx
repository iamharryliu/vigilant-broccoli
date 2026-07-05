'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { Text, TextField } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import {
  DEMO_SIGNATURE,
  PRESET_TEMPLATES,
  renderTemplate,
  SignatureTemplate,
} from './signatures.shared';
import { sanitizeSignatureHtml } from './sanitize-signature';
import { useTranslation } from '../../i18n';

const FORM_TAB_PRESET = 'preset';
const FORM_TAB_CUSTOM = 'custom';

const DEFAULT_FORM: SignatureTemplate = { id: '', label: '', template: '' };

const SignatureHtml = ({ template }: { template: string }) => (
  <div
    dangerouslySetInnerHTML={{
      __html: sanitizeSignatureHtml(renderTemplate(template, DEMO_SIGNATURE)),
    }}
  />
);

const findPresetByTemplate = (template: string) =>
  PRESET_TEMPLATES.find(preset => preset.template === template);

const isPresetLabel = (label: string) =>
  PRESET_TEMPLATES.some(preset => preset.label === label);

const SignatureForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<SignatureTemplate>) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState(initialFormValues.label);
  const [template, setTemplate] = useState(initialFormValues.template);
  const [formTab, setFormTab] = useState(
    initialFormValues.template &&
      !findPresetByTemplate(initialFormValues.template)
      ? FORM_TAB_CUSTOM
      : FORM_TAB_PRESET,
  );

  const selectedPresetId = findPresetByTemplate(template)?.id;

  const selectPreset = (preset: SignatureTemplate) => {
    setTemplate(preset.template);
    if (!label.trim() || isPresetLabel(label)) setLabel(preset.label);
  };

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {t('SIGNATURES.FORM.LABEL_FIELD')}
        </Text>
        <TextField.Root
          placeholder={t('SIGNATURES.FORM.LABEL_FIELD')}
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>
      <Tabs value={formTab} onValueChange={setFormTab}>
        <TabsList className="w-full">
          <TabsTrigger className="flex-1" value={FORM_TAB_PRESET}>
            {t('SIGNATURES.FORM.PRESET_TAB')}
          </TabsTrigger>
          <TabsTrigger className="flex-1" value={FORM_TAB_CUSTOM}>
            {t('SIGNATURES.FORM.CUSTOM_TAB')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value={FORM_TAB_PRESET}>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {PRESET_TEMPLATES.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`flex items-center justify-between gap-3 text-left border rounded-md p-3 transition-colors cursor-pointer ${
                  preset.id === selectedPresetId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <Text size="1" weight="medium">
                  {preset.label}
                </Text>
                <SignatureHtml template={preset.template} />
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value={FORM_TAB_CUSTOM}>
          <Textarea
            placeholder={t('SIGNATURES.FORM.TEMPLATE_PLACEHOLDER')}
            value={template}
            onChange={e => setTemplate(e.target.value)}
            rows={8}
          />
        </TabsContent>
      </Tabs>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {t('SIGNATURES.FORM.PREVIEW')}
        </Text>
        <div className="border border-gray-200 rounded-md p-4 min-h-16">
          {template.trim() ? (
            <SignatureHtml template={template} />
          ) : (
            <Text size="1" color="gray">
              {t('SIGNATURES.FORM.PREVIEW_EMPTY')}
            </Text>
          )}
        </div>
      </div>
      <Button
        disabled={!label.trim() || !template.trim()}
        onClick={async () =>
          submitHandler({ ...initialFormValues, label, template }, formType)
        }
      >
        {formType === FORM_TYPE.UPDATE
          ? t('SIGNATURES.FORM.SAVE')
          : t('SIGNATURES.FORM.ADD')}
      </Button>
    </div>
  );
};

type SignatureListItemProps = {
  item: SignatureTemplate;
  selectedId: string;
};

const SignatureListItem = ({ item, selectedId }: SignatureListItemProps) => {
  const { t } = useTranslation();
  const isSelected = item.id === selectedId;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Text weight="bold" size="2">
          {item.label}
        </Text>
        {isSelected && (
          <Text size="1" color="green" weight="medium">
            {t('SIGNATURES.FORM.SELECTED_BADGE')}
          </Text>
        )}
      </div>
      <SignatureHtml template={item.template} />
    </div>
  );
};

export const SignatureManager = ({
  templates,
  setTemplates,
  selectedId,
  selectTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
}: {
  templates: SignatureTemplate[];
  setTemplates: Dispatch<SetStateAction<SignatureTemplate[]>>;
  selectedId: string;
  selectTemplate: (template: SignatureTemplate) => Promise<void>;
  createTemplate: (form: SignatureTemplate) => Promise<SignatureTemplate>;
  updateTemplate: (item: SignatureTemplate) => Promise<void>;
  deleteTemplate: (id: string | number) => Promise<void>;
}) => {
  const { t } = useTranslation();
  const copy = {
    LIST: {
      TITLE: t('SIGNATURES.LIST.TITLE'),
      EMPTY_MESSAGE: t('SIGNATURES.LIST.EMPTY'),
    },
    [FORM_TYPE.CREATE]: {
      TITLE: t('SIGNATURES.FORM.CREATE_TITLE'),
      DESCRIPTION: t('SIGNATURES.FORM.CREATE_DESCRIPTION'),
    },
    [FORM_TYPE.UPDATE]: {
      TITLE: t('SIGNATURES.FORM.UPDATE_TITLE'),
      DESCRIPTION: t('SIGNATURES.FORM.UPDATE_DESCRIPTION'),
    },
  };
  return (
    <CRUDItemList<SignatureTemplate>
      items={templates}
      setItems={setTemplates}
      createItem={createTemplate}
      createItemFormDefaultValues={DEFAULT_FORM}
      updateItem={updateTemplate}
      deleteItem={deleteTemplate}
      FormComponent={SignatureForm}
      ListItemComponent={({ item }) => (
        <SignatureListItem item={item} selectedId={selectedId} />
      )}
      copy={copy}
      isCards
      onItemClick={item => void selectTemplate(item)}
    />
  );
};
