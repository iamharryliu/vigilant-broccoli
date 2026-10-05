'use client';

import { useEffect } from 'react';
import { PAGE_TITLE } from '../app.const';
import { TasksInput } from './tasks-input';

const CLOSE_LABEL = 'Close';

export const CreateTasksDialog = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={PAGE_TITLE.TASKS}
      className="fixed inset-0 z-50 flex md:items-center md:justify-center md:bg-black/40"
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full h-full bg-gray-50 md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-xl md:shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white md:rounded-t-xl">
          <h2 className="text-base font-semibold">{PAGE_TITLE.TASKS}</h2>
          <button
            onClick={onClose}
            aria-label={CLOSE_LABEL}
            className="text-gray-500 hover:text-black px-2 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <TasksInput onCreated={onCreated} />
        </div>
      </div>
    </div>
  );
};
