'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import { type QuickLink } from '@vigilant-broccoli/common-js';
import { QuickLinksPanel, type ShellExecuteHandler } from './QuickLinksPanel';
import {
  CloseButton,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  EmbedDialog,
  FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
} from '@vigilant-broccoli/react-lib';

const DIALOG_TITLE = 'Quick Links';
const DIALOG_MAX_WIDTH = 800;
const CLOSE_LABEL = 'Close';
const HEADER_CLASS = 'flex items-center justify-between gap-2 mb-3';
const CLOSE_BUTTON_CLASS = 'sm:hidden';
const HEIGHT_VAR = '--quick-links-height';
// Only `sm:` and up animate, so the full-screen mobile layout keeps its flex sizing.
// The height var is spelled out because Tailwind only generates classes written as literal strings.
const ANIMATED_HEIGHT_CLASS =
  'flex min-h-0 flex-col overflow-hidden max-sm:flex-1 sm:h-[var(--quick-links-height)] sm:transition-[height] sm:duration-200 sm:ease-out motion-reduce:transition-none';
// Dialog viewport margin (2rem) plus DialogContent padding (2 * 1.5rem) and border (2px).
const MEASURED_CLASS =
  'flex flex-col max-sm:min-h-0 max-sm:flex-1 sm:shrink-0 sm:max-h-[calc(100dvh-5rem-2px)]';

export type QuickLinksDialogProps = {
  links: QuickLink[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShellExecute?: ShellExecuteHandler;
  canEmbed?: () => boolean;
  enableFavorites?: boolean;
};

export function QuickLinksDialog({
  links,
  open,
  onOpenChange,
  onShellExecute,
  canEmbed,
  enableFavorites = false,
}: QuickLinksDialogProps) {
  const [embedLink, setEmbedLink] = useState<QuickLink | null>(null);
  const [measured, setMeasured] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  // `height: auto` cannot transition, so the wrapper height follows the content's natural height.
  useEffect(() => {
    if (!measured) {
      setHeight(null);
      return;
    }
    const observer = new ResizeObserver(() => setHeight(measured.offsetHeight));
    observer.observe(measured);
    return () => observer.disconnect();
  }, [measured]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className={cn(
            'block w-[calc(100%-2rem)] max-w-[600px] max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto',
            FULL_SCREEN_ON_MOBILE_DIALOG_CLASS,
          )}
          style={{
            maxWidth: DIALOG_MAX_WIDTH,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            className={height === null ? 'contents' : ANIMATED_HEIGHT_CLASS}
            style={
              height === null
                ? undefined
                : ({ [HEIGHT_VAR]: `${height}px` } as CSSProperties)
            }
          >
            <div ref={setMeasured} className={MEASURED_CLASS}>
              <div className={HEADER_CLASS}>
                <DialogTitle className="mb-0 text-xl font-bold leading-7 tracking-normal">
                  {DIALOG_TITLE}
                </DialogTitle>
                <DialogClose asChild>
                  <CloseButton
                    aria-label={CLOSE_LABEL}
                    className={CLOSE_BUTTON_CLASS}
                  />
                </DialogClose>
              </div>

              <QuickLinksPanel
                links={links}
                enableFavorites={enableFavorites}
                onShellExecute={onShellExecute}
                autoFocusSearch={open}
                onLinkOpen={() => onOpenChange(false)}
                onEmbedOpen={setEmbedLink}
                canEmbed={canEmbed}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <EmbedDialog
        title={embedLink?.label ?? ''}
        url={embedLink?.target ?? null}
        onOpenChange={open => !open && setEmbedLink(null)}
      />
    </>
  );
}
