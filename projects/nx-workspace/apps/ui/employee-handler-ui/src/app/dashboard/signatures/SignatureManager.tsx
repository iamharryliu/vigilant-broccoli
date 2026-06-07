'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { Text, TextField } from '@radix-ui/themes';
import {
  Button,
  CRUDFormProps,
  CRUDItemList,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { FORM_TYPE } from '@vigilant-broccoli/common-js';
import {
  DEMO_SIGNATURE,
  renderTemplate,
  SignatureTemplate,
} from './signatures.shared';
import { sanitizeSignatureHtml } from './sanitize-signature';

const COPY = {
  LIST: { TITLE: 'Signatures', EMPTY_MESSAGE: 'No signatures yet.' },
  [FORM_TYPE.CREATE]: {
    TITLE: 'Add Signature',
    DESCRIPTION: 'Add a new signature template.',
  },
  [FORM_TYPE.UPDATE]: {
    TITLE: 'Update Signature',
    DESCRIPTION: 'Edit the signature template.',
  },
};

const LABEL_FIELD = 'Label';
const TEMPLATE_FIELD = 'HTML Template';
const TEMPLATE_PLACEHOLDER = 'Paste signature HTML here...';
const SAVE_LABEL = 'Save';
const ADD_LABEL = 'Add Signature';
const SELECTED_BADGE = 'Selected';

const DEFAULT_FORM: SignatureTemplate = { id: '', label: '', template: '' };

const SignatureForm = ({
  formType,
  initialFormValues,
  submitHandler,
}: CRUDFormProps<SignatureTemplate>) => {
  const [label, setLabel] = useState(initialFormValues.label);
  const [template, setTemplate] = useState(initialFormValues.template);

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {LABEL_FIELD}
        </Text>
        <TextField.Root
          placeholder={LABEL_FIELD}
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </div>
      <div>
        <Text size="1" weight="medium" as="p" mb="1">
          {TEMPLATE_FIELD}
        </Text>
        <Textarea
          placeholder={TEMPLATE_PLACEHOLDER}
          value={template}
          onChange={e => setTemplate(e.target.value)}
          rows={8}
        />
      </div>
      <Button
        onClick={async () =>
          submitHandler({ ...initialFormValues, label, template }, formType)
        }
      >
        {formType === FORM_TYPE.UPDATE ? SAVE_LABEL : ADD_LABEL}
      </Button>
    </div>
  );
};

type SignatureListItemProps = {
  item: SignatureTemplate;
  selectedId: string;
};

const SignatureListItem = ({ item, selectedId }: SignatureListItemProps) => {
  const isSelected = item.id === selectedId;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <Text weight="bold" size="2">
          {item.label}
        </Text>
        {isSelected && (
          <Text size="1" color="green" weight="medium">
            {SELECTED_BADGE}
          </Text>
        )}
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeSignatureHtml(
            renderTemplate(item.template, DEMO_SIGNATURE),
          ),
        }}
      />
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
}) => (
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
    copy={COPY}
    isCards
    onItemClick={item => void selectTemplate(item)}
  />
);
