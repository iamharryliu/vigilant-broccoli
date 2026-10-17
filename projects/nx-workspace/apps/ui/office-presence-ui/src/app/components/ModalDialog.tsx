import { useMemo, useRef, useState } from 'react';
import { BlockAction } from '../../lib/demo-client';
import {
  DemoUser,
  ElementState,
  SlackView,
  ViewStateValues,
} from '../../lib/demo.types';
import { collectViewState, stateKey } from '../../lib/element-state';
import { isMarkup, SlackText } from '../../lib/slack-text';
import { useTranslation } from '../i18n';
import { BlockView } from './BlockView';

type Props = {
  view: SlackView;
  users: DemoUser[];
  botUserId: string;
  userName: (userId: string) => string;
  onClose: () => void;
  onSubmit: (callbackId: string, values: ViewStateValues) => void;
  onAction: (action: BlockAction) => void;
};

export const ModalDialog = ({
  view,
  users,
  botUserId,
  userName,
  onClose,
  onSubmit,
  onAction,
}: Props) => {
  const { t } = useTranslation();
  const touched = useRef<Record<string, ElementState>>({});
  const [invalidBlocks, setInvalidBlocks] = useState<Set<string>>(new Set());

  const ctx = useMemo(
    () => ({
      users,
      botUserId,
      userName,
      mode: 'form' as const,
      fire: onAction,
      report: (blockId: string, actionId: string, state: ElementState) => {
        touched.current[stateKey(blockId, actionId)] = state;
      },
    }),
    [users, botUserId, userName, onAction],
  );

  const submit = () => {
    const { values, invalidBlocks: invalid } = collectViewState(
      view.blocks,
      touched.current,
    );
    setInvalidBlocks(invalid);
    if (invalid.size === 0 && view.callback_id) {
      onSubmit(view.callback_id, values);
    }
  };

  return (
    <div className="overlay">
      <div className="dialog" role="dialog" aria-modal="true">
        <header>
          <span>
            {view.title && (
              <SlackText
                text={view.title.text}
                markup={isMarkup(view.title)}
                userName={userName}
              />
            )}
          </span>
          <button aria-label={t('FORM.CLOSE')} onClick={onClose}>
            ×
          </button>
        </header>
        <div className="body">
          <BlockView
            blocks={view.blocks}
            ctx={ctx}
            invalidBlocks={invalidBlocks}
          />
        </div>
        <footer>
          {view.close && (
            <button className="btn" onClick={onClose}>
              {view.close.text}
            </button>
          )}
          {view.submit && view.callback_id && (
            <button className="btn primary" onClick={submit}>
              {view.submit.text}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
