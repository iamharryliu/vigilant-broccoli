'use client';

import { Check, UserX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Text,
  UserAvatar,
  cn,
} from '@vigilant-broccoli/react-lib';
import { TaskAssignee, getAssigneeLabel } from './tasks.utils';

const UNASSIGNED_LABEL = 'Unassigned';
const OPTION_CLASS =
  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted';

type Props = {
  /** Title of the task being assigned; the dialog is closed when null. */
  taskTitle: string | null;
  assignedUserId: string | null;
  members: TaskAssignee[];
  onAssign: (userId: string | null) => void;
  onClose: () => void;
};

export function AssignTaskDialog({
  taskTitle,
  assignedUserId,
  members,
  onAssign,
  onClose,
}: Props) {
  const renderOption = (
    userId: string | null,
    label: string,
    icon: React.ReactNode,
  ) => (
    <button
      key={userId ?? UNASSIGNED_LABEL}
      type="button"
      className={cn(OPTION_CLASS, assignedUserId === userId && 'bg-muted')}
      onClick={() => onAssign(userId)}
    >
      {icon}
      <Text size="2" className="min-w-0 flex-1 truncate">
        {label}
      </Text>
      {assignedUserId === userId && <Check size={14} />}
    </button>
  );

  return (
    <Dialog
      open={taskTitle !== null}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="block max-h-[calc(100dvh-2rem)] max-w-sm overflow-y-auto"
      >
        <DialogTitle className="mb-3 truncate text-xl font-bold">
          Assign {taskTitle}
        </DialogTitle>
        <div className="flex flex-col gap-1">
          {renderOption(
            null,
            UNASSIGNED_LABEL,
            <UserX size={20} className="shrink-0" />,
          )}
          {members.map(member =>
            renderOption(
              member.userId,
              getAssigneeLabel(member),
              <UserAvatar name={member.email} size="xsmall" />,
            ),
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
