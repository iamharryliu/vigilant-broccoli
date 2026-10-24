import { SlackBlock, TextObject } from '../../lib/demo.types';
import { blockIdOf } from '../../lib/element-state';
import { isMarkup, SlackText } from '../../lib/slack-text';
import { useTranslation } from '../i18n';
import { ElementContext, ElementView } from './ElementView';
import { SlackElement } from '../../lib/demo.types';

type Props = {
  blocks: SlackBlock[];
  ctx: ElementContext;
  invalidBlocks?: Set<string>;
};

export const BlockView = ({ blocks, ctx, invalidBlocks }: Props) => {
  const { t } = useTranslation();
  const text = (value?: TextObject) =>
    value ? (
      <SlackText
        text={value.text}
        markup={isMarkup(value)}
        userName={ctx.userName}
      />
    ) : null;

  return (
    <>
      {blocks.map((block, index) => {
        const blockId = blockIdOf(block, index);
        switch (block.type) {
          case 'header':
            return (
              <h2 key={blockId} className="header">
                {text(block.text)}
              </h2>
            );
          case 'divider':
            return <hr key={blockId} />;
          case 'section':
            return (
              <div key={blockId} className="section">
                <div className="text">{text(block.text)}</div>
                {block.accessory && (
                  <div className="accessory">
                    <ElementView
                      element={block.accessory}
                      blockId={blockId}
                      ctx={ctx}
                    />
                  </div>
                )}
              </div>
            );
          case 'actions':
            return (
              <div key={blockId} className="actions">
                {(block.elements as SlackElement[]).map((element, i) => (
                  <ElementView
                    key={element.action_id ?? i}
                    element={element}
                    blockId={blockId}
                    ctx={ctx}
                  />
                ))}
              </div>
            );
          case 'context':
            return (
              <div key={blockId} className="ctx">
                {(block.elements as TextObject[]).map((element, i) => (
                  <span key={i}>{text(element)} </span>
                ))}
              </div>
            );
          case 'input':
            return (
              <div
                key={blockId}
                className={`input-block${invalidBlocks?.has(blockId) ? ' invalid' : ''}`}
              >
                <span className="lbl">
                  {text(block.label)}
                  {block.optional && (
                    <span className="ctx"> {t('FORM.OPTIONAL')}</span>
                  )}
                </span>
                {block.element && (
                  <ElementView
                    element={block.element}
                    blockId={blockId}
                    ctx={ctx}
                  />
                )}
                <div className="err">{t('FORM.REQUIRED')}</div>
              </div>
            );
          default:
            return (
              <div key={blockId} className="ctx">
                [unsupported block: {block.type}]
              </div>
            );
        }
      })}
    </>
  );
};
