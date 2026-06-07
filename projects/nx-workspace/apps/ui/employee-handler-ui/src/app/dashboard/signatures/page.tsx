'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { SignaturePreviewer } from './SignaturePreviewer';
import { SignatureManager } from './SignatureManager';
import {
  SignatureTemplate,
  TEMPLATES_ENDPOINT,
  UPDATE_ALL_ENDPOINT,
} from './signatures.shared';
import { authFetch } from '../../../lib/api-helpers';

const PAGE_CONTAINER = 'max-w-3xl mx-auto p-8 space-y-6';

const TAB_QUERY_KEY = 'tab';
const TAB_MANAGER = 'manager';
const TAB_PREVIEW = 'preview';
const LABEL_MANAGER = 'Signature Manager';
const LABEL_PREVIEW = 'Signature Previewer';

const NEW_TEMPLATE_PREFIX = 'custom-';

const SignaturesTabs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get(TAB_QUERY_KEY) ?? TAB_MANAGER;

  const [templates, setTemplates] = useState<SignatureTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    authFetch(TEMPLATES_ENDPOINT)
      .then(res => res.json())
      .then((data: { templates: SignatureTemplate[] }) => {
        const list = data.templates ?? [];
        setTemplates(list);
        if (list[0]) setSelectedId(list[0].id);
      });
  }, []);

  const activeTemplate =
    templates.find(t => t.id === selectedId)?.template ?? '';

  const selectTemplate = async (template: SignatureTemplate) => {
    setSelectedId(template.id);
    await authFetch(UPDATE_ALL_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify({ template: template.template }),
    });
  };

  const createTemplate = async (
    form: SignatureTemplate,
  ): Promise<SignatureTemplate> => {
    const newTemplate: SignatureTemplate = {
      ...form,
      id: `${NEW_TEMPLATE_PREFIX}${Date.now()}`,
    };
    const res = await authFetch(TEMPLATES_ENDPOINT, {
      method: HTTP_METHOD.POST,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify(newTemplate),
    });
    return res.json();
  };

  const updateTemplate = async (item: SignatureTemplate): Promise<void> => {
    await authFetch(`${TEMPLATES_ENDPOINT}/${item.id}`, {
      method: HTTP_METHOD.PATCH,
      headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
      body: JSON.stringify({ label: item.label, template: item.template }),
    });
  };

  const deleteTemplate = async (id: string | number): Promise<void> => {
    await authFetch(`${TEMPLATES_ENDPOINT}/${id}`, {
      method: HTTP_METHOD.DELETE,
    });
  };

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(TAB_QUERY_KEY, value);
    router.replace(`?${params.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value={TAB_MANAGER}>{LABEL_MANAGER}</TabsTrigger>
        <TabsTrigger value={TAB_PREVIEW}>{LABEL_PREVIEW}</TabsTrigger>
      </TabsList>
      <TabsContent value={TAB_MANAGER}>
        <SignatureManager
          templates={templates}
          setTemplates={setTemplates}
          selectedId={selectedId}
          selectTemplate={selectTemplate}
          createTemplate={createTemplate}
          updateTemplate={updateTemplate}
          deleteTemplate={deleteTemplate}
        />
      </TabsContent>
      <TabsContent value={TAB_PREVIEW}>
        <SignaturePreviewer activeTemplate={activeTemplate} />
      </TabsContent>
    </Tabs>
  );
};

export default function SignaturesPage() {
  return (
    <div className={PAGE_CONTAINER}>
      <Suspense>
        <SignaturesTabs />
      </Suspense>
    </div>
  );
}
