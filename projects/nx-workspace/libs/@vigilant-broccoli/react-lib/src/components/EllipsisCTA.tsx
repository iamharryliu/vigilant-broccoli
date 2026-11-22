'use client';

import { type ReactNode, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { DeleteItemConfirmationDialog } from './DeleteItemConfirmationDialog';
import { DropdownMenu } from './DropdownMenu';
import { IconButton, type IconButtonIcon } from './IconButton';

const DEFAULT_DELETE_LABEL = 'Delete';
const DEFAULT_UPDATE_LABEL = 'Update';
const ACTION_ICON_SIZE = 16;

type EllipsisIcon = Extract<IconButtonIcon, `ellipsis-${string}`>;

type EllipsisActionColor = 'red' | 'green' | 'blue' | 'gray' | 'amber';

export type EllipsisAction = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void | Promise<void>;
  color?: EllipsisActionColor;
  disabled?: boolean;
  confirm?: {
    title?: string;
    description?: string;
    confirmLabel?: string;
  };
};

export const EllipsisCTA = ({
  onUpdate,
  onDelete,
  deleteDisabled = false,
  confirmDescription,
  confirmTitle,
  updateLabel = DEFAULT_UPDATE_LABEL,
  deleteLabel = DEFAULT_DELETE_LABEL,
  actions,
  icon = 'ellipsis-horizontal',
  disabled = false,
}: {
  onUpdate?: () => void;
  onDelete?: () => void | Promise<void>;
  deleteDisabled?: boolean;
  confirmDescription?: string;
  confirmTitle?: string;
  updateLabel?: string;
  deleteLabel?: string;
  actions?: EllipsisAction[];
  icon?: EllipsisIcon;
  disabled?: boolean;
}) => {
  const [pendingConfirm, setPendingConfirm] = useState<EllipsisAction | null>(
    null,
  );

  const resolvedActions: EllipsisAction[] =
    actions ??
    ([
      onUpdate && {
        label: updateLabel,
        icon: <Pencil size={ACTION_ICON_SIZE} />,
        onSelect: onUpdate,
      },
      onDelete && {
        label: deleteLabel,
        icon: <Trash2 size={ACTION_ICON_SIZE} />,
        color: 'red' as const,
        disabled: deleteDisabled,
        onSelect: onDelete,
        confirm: {
          title: confirmTitle,
          description: confirmDescription,
          confirmLabel: deleteLabel,
        },
      },
    ].filter(Boolean) as EllipsisAction[]);

  const handleSelect = (action: EllipsisAction) => {
    if (action.confirm) {
      setPendingConfirm(action);
      return;
    }
    void action.onSelect();
  };

  return (
    <div onClick={e => e.stopPropagation()}>
      {/* A modal menu that hands off to a dialog leaves pointer-events: none on
          <body> once the dialog closes (e.g. via Esc), freezing the whole page. */}
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" icon={icon} disabled={disabled} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {resolvedActions.map((action, idx) => (
            <DropdownMenu.Item
              key={`${action.label}-${idx}`}
              color={action.color}
              disabled={action.disabled}
              onSelect={() => handleSelect(action)}
            >
              {action.icon}
              {action.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
      <DeleteItemConfirmationDialog
        open={pendingConfirm !== null}
        onOpenChange={open => {
          if (!open) setPendingConfirm(null);
        }}
        title={pendingConfirm?.confirm?.title}
        description={pendingConfirm?.confirm?.description}
        confirmLabel={
          pendingConfirm?.confirm?.confirmLabel ?? pendingConfirm?.label
        }
        deleteItem={async () => {
          if (!pendingConfirm) return;
          await pendingConfirm.onSelect();
          setPendingConfirm(null);
        }}
      />
    </div>
  );
};
