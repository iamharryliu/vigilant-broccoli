'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from '@vigilant-broccoli/react-lib';
import { HTTP_HEADERS, HTTP_METHOD } from '@vigilant-broccoli/common-js';
import { SignaturePreviewer } from './SignaturePreviewer';
import { SignatureManager } from './SignatureManager';
import {
  SignatureTemplate,
  TEMPLATES_ENDPOINT,
  UPDATE_ALL_ENDPOINT,
} from './signatures.shared';
import { authFetchOk, errorMessage } from '../../../lib/api-helpers';
import { useAction } from '../../../lib/use-action';
import { useTranslation } from '../../i18n';

const PAGE_CONTAINER = 'max-w-3xl mx-auto p-8 space-y-6';

const TAB_QUERY_KEY = 'tab';
const TAB_MANAGER = 'manager';
const TAB_PREVIEW = 'preview';

const NEW_TEMPLATE_PREFIX = 'custom-';

const withToast = async <T,>(
  action: () => Promise<T>,
  success: string,
): Promise<T> => {
  try {
    const result = await action();
    toast.success(success);
    return result;
  } catch (err) {
    toast.error(errorMessage(err));
    throw err;
  }
};

const SignaturesTabs = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const tab = searchParams.get(TAB_QUERY_KEY) ?? TAB_MANAGER;

  const [templates, setTemplates] = useState<SignatureTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const { run } = useAction();

  useEffect(() => {
    authFetchOk(TEMPLATES_ENDPOINT)
      .then(res => res.json())
      .then((data: { templates: SignatureTemplate[] }) => {
        const list = data.templates ?? [];
        setTemplates(list);
      })
      .catch(() => toast.error(t('SIGNATURES.ERROR.LOAD_FAILED')))
      .finally(() => setTemplatesLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      templatesLoaded &&
      tab === TAB_PREVIEW &&
      (!templates.length || !selectedId)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(TAB_QUERY_KEY, TAB_MANAGER);
      router.replace(`?${params.toString()}`);
    }
  }, [templatesLoaded, tab, templates.length, selectedId]);

  const selectTemplate = (template: SignatureTemplate) =>
    run(
      async () => {
        await authFetchOk(UPDATE_ALL_ENDPOINT, {
          method: HTTP_METHOD.POST,
          headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
          body: JSON.stringify({ template: template.template }),
        });
        setSelectedId(template.id);
      },
      { success: t('SIGNATURES.SUCCESS.SELECT') },
    );

  const createTemplate = (
    form: SignatureTemplate,
  ): Promise<SignatureTemplate> =>
    withToast(async () => {
      const newTemplate: SignatureTemplate = {
        ...form,
        id: `${NEW_TEMPLATE_PREFIX}${Date.now()}`,
      };
      const res = await authFetchOk(TEMPLATES_ENDPOINT, {
        method: HTTP_METHOD.POST,
        headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
        body: JSON.stringify(newTemplate),
      });
      return res.json();
    }, t('SIGNATURES.SUCCESS.CREATE'));

  const updateTemplate = (item: SignatureTemplate): Promise<void> =>
    withToast(async () => {
      await authFetchOk(`${TEMPLATES_ENDPOINT}/${item.id}`, {
        method: HTTP_METHOD.PATCH,
        headers: HTTP_HEADERS.CONTENT_TYPE.JSON,
        body: JSON.stringify({ label: item.label, template: item.template }),
      });
    }, t('SIGNATURES.SUCCESS.UPDATE'));

  const deleteTemplate = (id: string | number): Promise<void> =>
    withToast(async () => {
      await authFetchOk(`${TEMPLATES_ENDPOINT}/${id}`, {
        method: HTTP_METHOD.DELETE,
      });
    }, t('SIGNATURES.SUCCESS.DELETE'));

  const onTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(TAB_QUERY_KEY, value);
    router.replace(`?${params.toString()}`);
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value={TAB_MANAGER}>
          {t('SIGNATURES.TAB.MANAGER')}
        </TabsTrigger>
        <TabsTrigger value={TAB_PREVIEW} disabled={!selectedId}>
          {t('SIGNATURES.TAB.PREVIEW')}
        </TabsTrigger>
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
        <SignaturePreviewer templates={templates} selectedId={selectedId} />
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
