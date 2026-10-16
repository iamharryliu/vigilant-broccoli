import { useState } from 'react';
import { BlockAction } from '../../lib/demo-client';
import {
  DemoUser,
  ElementState,
  SlackElement,
  SlackOption,
} from '../../lib/demo.types';
import { isMarkup, SlackText } from '../../lib/slack-text';
import { useTranslation } from '../i18n';

export type ElementContext = {
  users: DemoUser[];
  botUserId: string;
  userName: (userId: string) => string;
  // Home elements fire an action on change; modal elements only report state for submit.
  mode: 'live' | 'form';
  fire: (action: BlockAction) => void;
  report: (blockId: string, actionId: string, state: ElementState) => void;
};

type Props = { element: SlackElement; blockId: string; ctx: ElementContext };

const OptionLabel = ({
  option,
  ctx,
}: {
  option: SlackOption;
  ctx: ElementContext;
}) => (
  <span>
    <SlackText
      text={option.text.text}
      markup={isMarkup(option.text)}
      userName={ctx.userName}
    />
    {option.description && (
      <small>
        <SlackText
          text={option.description.text}
          markup={isMarkup(option.description)}
          userName={ctx.userName}
        />
      </small>
    )}
  </span>
);

const ChoiceGroup = ({ element, blockId, ctx }: Props) => {
  const isRadio = element.type === 'radio_buttons';
  const actionId = element.action_id as string;
  const [picked, setPicked] = useState<string[]>(
    (isRadio ? [element.initial_option] : (element.initial_options ?? []))
      .filter((option): option is SlackOption => !!option)
      .map(option => option.value),
  );

  const toggle = (value: string, checked: boolean) => {
    const next = isRadio
      ? [value]
      : checked
        ? [...picked, value]
        : picked.filter(item => item !== value);
    setPicked(next);
    const selected = next.map(item => ({ value: item }));
    if (isRadio) {
      ctx.report(blockId, actionId, {
        type: element.type,
        selected_option: selected[0],
      });
    } else if (ctx.mode === 'live') {
      ctx.fire({
        type: 'checkboxes',
        action_id: actionId,
        block_id: blockId,
        selected_options: selected,
      });
    } else {
      ctx.report(blockId, actionId, {
        type: element.type,
        selected_options: selected,
      });
    }
  };

  return (
    <div className="options">
      {(element.options ?? []).map(option => (
        <label key={option.value}>
          <input
            type={isRadio ? 'radio' : 'checkbox'}
            name={`${blockId}-${actionId}`}
            value={option.value}
            checked={picked.includes(option.value)}
            onChange={event => toggle(option.value, event.target.checked)}
          />
          <OptionLabel option={option} ctx={ctx} />
        </label>
      ))}
    </div>
  );
};

const StaticSelect = ({ element, blockId, ctx }: Props) => {
  const { t } = useTranslation();
  const actionId = element.action_id as string;
  const [value, setValue] = useState(element.initial_option?.value ?? '');

  const change = (next: string) => {
    setValue(next);
    const selected = next ? { value: next } : null;
    if (ctx.mode === 'live') {
      ctx.fire({
        type: 'static_select',
        action_id: actionId,
        block_id: blockId,
        selected_option: selected,
      });
    } else {
      ctx.report(blockId, actionId, {
        type: element.type,
        selected_option: selected,
      });
    }
  };

  return (
    <select
      className="field"
      value={value}
      onChange={event => change(event.target.value)}
    >
      {!element.initial_option && (
        <option value="">
          {element.placeholder?.text ?? t('FORM.SELECT_PLACEHOLDER')}
        </option>
      )}
      {(element.options ?? []).map(option => (
        <option key={option.value} value={option.value}>
          {option.text.text}
        </option>
      ))}
    </select>
  );
};

const TextInput = ({ element, blockId, ctx }: Props) => {
  const actionId = element.action_id as string;
  const [value, setValue] = useState(element.initial_value ?? '');
  const change = (next: string) => {
    setValue(next);
    ctx.report(blockId, actionId, { type: element.type, value: next || null });
  };
  const shared = {
    className: 'field',
    value,
    maxLength: element.max_length,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => change(event.target.value),
  };
  return element.multiline ? (
    <textarea rows={3} {...shared} />
  ) : (
    <input {...shared} />
  );
};

const UsersSelect = ({ element, blockId, ctx }: Props) => {
  const actionId = element.action_id as string;
  const [picked, setPicked] = useState(element.initial_users ?? []);
  const toggle = (userId: string, checked: boolean) => {
    const next = checked
      ? [...picked, userId]
      : picked.filter(item => item !== userId);
    setPicked(next);
    ctx.report(blockId, actionId, { type: element.type, selected_users: next });
  };
  return (
    <div className="options">
      {ctx.users
        .filter(user => user.id !== ctx.botUserId)
        .map(user => (
          <label key={user.id}>
            <input
              type="checkbox"
              value={user.id}
              checked={picked.includes(user.id)}
              onChange={event => toggle(user.id, event.target.checked)}
            />
            <span>
              {user.realName}
              <small>{user.title}</small>
            </span>
          </label>
        ))}
    </div>
  );
};

export const ElementView = (props: Props) => {
  const { element, blockId, ctx } = props;
  switch (element.type) {
    case 'button':
      return (
        <button
          className={`btn${element.style ? ` ${element.style}` : ''}`}
          onClick={() => {
            if (
              element.confirm &&
              !window.confirm(element.confirm.text.text.replace(/\*/g, ''))
            ) {
              return;
            }
            ctx.fire({
              type: 'button',
              action_id: element.action_id,
              block_id: blockId,
              value: element.value,
            });
          }}
        >
          {element.text && (
            <SlackText
              text={element.text.text}
              markup={isMarkup(element.text)}
              userName={ctx.userName}
            />
          )}
        </button>
      );
    case 'checkboxes':
    case 'radio_buttons':
      return <ChoiceGroup {...props} />;
    case 'static_select':
      return <StaticSelect {...props} />;
    case 'plain_text_input':
      return <TextInput {...props} />;
    case 'multi_users_select':
      return <UsersSelect {...props} />;
    default:
      return <div className="ctx">[unsupported element: {element.type}]</div>;
  }
};
