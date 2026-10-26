'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eraser, Sparkles, Upload, UserRound } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Textarea,
} from '@vigilant-broccoli/react-lib';
import { toast } from '@vigilant-broccoli/react-lib/toaster';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { RUNS_TAB_URL } from '../app.const';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import {
  CAREER_IMPORT_EXTENSIONS,
  CAREER_PRESET,
  CareerFileKind,
  CareerPreset,
} from '../constants/career';
import { useTranslation } from '../i18n';

const TEXT_FIELD = 'text';
const ICON_SIZE = 14;
const FILE_FIELD = 'file';

const STEP = {
  CHOOSE: 'choose',
  UPLOAD: 'upload',
  ...CAREER_PRESET,
} as const;

type Step = (typeof STEP)[keyof typeof STEP];

const OPTIONS = [
  {
    step: STEP.UPLOAD,
    icon: Upload,
    titleKey: 'CAREER.UPLOAD_TITLE',
    hintKey: 'CAREER.UPLOAD_HINT',
  },
  {
    step: STEP.BLANK,
    icon: Eraser,
    titleKey: 'CAREER.CLEAR_TITLE',
    hintKey: 'CAREER.CLEAR_HINT',
  },
  {
    step: STEP.SAMPLE,
    icon: UserRound,
    titleKey: 'CAREER.SAMPLE_TITLE',
    hintKey: 'CAREER.SAMPLE_HINT',
  },
] as const;

const kindQuery = (kind: CareerFileKind) => `?kind=${kind}`;

const errorMessage = async (response: Response, fallback: string) =>
  (await response.json().catch(() => ({}))).error ?? fallback;

type CareerResetDialogProps = {
  kind: CareerFileKind;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Called after Clear or Sample rewrote the saved file.
  onReset: () => void;
};

// Steps from picking an option to its form or confirmation. Every option
// replaces the saved file: Clear and Sample at once, Upload when its run
// finishes.
export const CareerResetDialog = ({
  kind,
  label,
  open,
  onOpenChange,
  onReset,
}: CareerResetDialogProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>(STEP.CHOOSE);
  const [busy, setBusy] = useState(false);

  const changeOpen = (next: boolean) => {
    if (!next) setStep(STEP.CHOOSE);
    onOpenChange(next);
  };

  const reset = async (preset: CareerPreset) => {
    setBusy(true);
    try {
      const response = await fetch(
        `${API_ENDPOINTS.CAREER_RESET}${kindQuery(kind)}`,
        {
          method: HTTP_METHOD.POST,
          headers: { [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE },
          body: JSON.stringify({ preset }),
        },
      );
      if (!response.ok) {
        throw new Error(await errorMessage(response, t('CAREER.RESET_FAILED')));
      }
      toast.success(t('CAREER.RESET_DONE', { label }));
      onReset();
      changeOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('CAREER.RESET_FAILED'),
      );
    } finally {
      setBusy(false);
    }
  };

  const upload = async () => {
    setBusy(true);
    try {
      const form = new FormData();
      form.append(TEXT_FIELD, text);
      if (file) form.append(FILE_FIELD, file);
      const response = await fetch(
        `${API_ENDPOINTS.CAREER_IMPORT}${kindQuery(kind)}`,
        { method: HTTP_METHOD.POST, body: form },
      );
      if (!response.ok) {
        throw new Error(
          await errorMessage(response, t('CAREER.UPLOAD_FAILED')),
        );
      }
      setText('');
      setFile(null);
      changeOpen(false);
      toast.success(t('CAREER.UPLOAD_STARTED', { label }), {
        action: {
          label: t('DIALOG.VIEW_PROGRESS'),
          onClick: () => router.push(RUNS_TAB_URL),
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('CAREER.UPLOAD_FAILED'),
      );
    } finally {
      setBusy(false);
    }
  };

  const option = OPTIONS.find(candidate => candidate.step === step);
  const back = (
    <Button
      variant="outline"
      onClick={() => setStep(STEP.CHOOSE)}
      disabled={busy}
    >
      <ArrowLeft size={ICON_SIZE} /> {t('CAREER.BACK')}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            {option
              ? `${t('CAREER.RESET_TITLE', { label })}: ${t(option.titleKey)}`
              : t('CAREER.RESET_TITLE', { label })}
          </DialogTitle>
          <DialogDescription>
            {option
              ? t(option.hintKey, { label })
              : t('CAREER.RESET_DESCRIPTION')}
          </DialogDescription>
        </DialogHeader>
        {step === STEP.CHOOSE && (
          <div className="flex flex-col gap-2">
            {OPTIONS.map(({ step: next, icon: Icon, titleKey, hintKey }) => (
              <button
                key={next}
                type="button"
                onClick={() => setStep(next)}
                className="flex items-start gap-3 rounded-md border border-border p-3 text-left hover:bg-accent"
              >
                <Icon size={18} className="mt-0.5 shrink-0" />
                <span className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{t(titleKey)}</span>
                  <span className="text-sm text-muted-foreground">
                    {t(hintKey, { label })}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
        {step === STEP.UPLOAD && (
          <>
            <Textarea
              value={text}
              onChange={event => setText(event.target.value)}
              disabled={busy}
              rows={8}
              placeholder={t('CAREER.UPLOAD_PLACEHOLDER')}
            />
            <input
              type="file"
              accept={CAREER_IMPORT_EXTENSIONS.join(',')}
              disabled={busy}
              onChange={event => setFile(event.target.files?.[0] ?? null)}
              className="min-w-0 text-sm"
            />
            <div className="flex justify-between gap-2">
              {back}
              <Button
                onClick={upload}
                loading={busy}
                disabled={!text.trim() && !file}
              >
                <Sparkles size={ICON_SIZE} /> {t('CAREER.UPLOAD')}
              </Button>
            </div>
          </>
        )}
        {(step === STEP.BLANK || step === STEP.SAMPLE) && (
          <>
            <p className="text-sm">{t('CAREER.CONFIRM_REPLACE', { label })}</p>
            <div className="flex justify-between gap-2">
              {back}
              <Button
                variant={step === STEP.BLANK ? 'destructive' : 'default'}
                onClick={() => reset(step)}
                loading={busy}
              >
                {step === STEP.BLANK ? (
                  <>
                    <Eraser size={ICON_SIZE} /> {t('CAREER.CLEAR')}
                  </>
                ) : (
                  <>
                    <UserRound size={ICON_SIZE} /> {t('CAREER.SAMPLE')}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
