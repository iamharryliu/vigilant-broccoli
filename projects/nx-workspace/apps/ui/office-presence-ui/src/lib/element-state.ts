import {
  ElementState,
  SlackBlock,
  SlackElement,
  ViewStateValues,
} from './demo.types';

export const stateKey = (blockId: string, actionId: string) =>
  `${blockId}\u0000${actionId}`;

export const blockIdOf = (block: SlackBlock, index: number) =>
  block.block_id ?? `block_${index}`;

export const initialState = (element: SlackElement): ElementState | null => {
  switch (element.type) {
    case 'checkboxes':
      return {
        type: element.type,
        selected_options: (element.initial_options ?? []).map(({ value }) => ({
          value,
        })),
      };
    case 'radio_buttons':
    case 'static_select':
      return {
        type: element.type,
        selected_option: element.initial_option
          ? { value: element.initial_option.value }
          : null,
      };
    case 'plain_text_input':
      return { type: element.type, value: element.initial_value || null };
    case 'multi_users_select':
      return {
        type: element.type,
        selected_users: element.initial_users ?? [],
      };
    default:
      return null;
  }
};

export const isFilled = (state: ElementState) => {
  if (state.selected_options) return state.selected_options.length > 0;
  if (state.selected_users) return state.selected_users.length > 0;
  if (state.selected_option !== undefined) return !!state.selected_option;
  return !!state.value?.trim();
};

const elementsOf = (block: SlackBlock): SlackElement[] => {
  const nested = (block.elements ?? []).filter(
    (item): item is SlackElement =>
      'action_id' in item || item.type === 'button',
  );
  return [block.accessory, block.element, ...nested].filter(
    (item): item is SlackElement => !!item,
  );
};

// Untouched inputs still submit their initial values, like a real Slack modal.
export const collectViewState = (
  blocks: SlackBlock[],
  touched: Record<string, ElementState>,
) => {
  const values: ViewStateValues = {};
  const invalidBlocks = new Set<string>();
  blocks.forEach((block, index) => {
    const blockId = blockIdOf(block, index);
    elementsOf(block).forEach(element => {
      if (!element.action_id) return;
      const state =
        touched[stateKey(blockId, element.action_id)] ?? initialState(element);
      if (!state) return;
      (values[blockId] ??= {})[element.action_id] = state;
      if (block.type === 'input' && !block.optional && !isFilled(state)) {
        invalidBlocks.add(blockId);
      }
    });
  });
  return { values, invalidBlocks };
};
