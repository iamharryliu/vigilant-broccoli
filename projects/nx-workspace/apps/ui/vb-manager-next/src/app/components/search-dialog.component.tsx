'use client';
import { HTTP_METHOD, HTTP_HEADERS } from '@vigilant-broccoli/common-js';
import {
  QuickLinksDialog,
  type ShellExecuteHandler,
} from '@vigilant-broccoli/react-lib';
import { QUICK_LINKS } from '../constants/quick-links';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { authFetch } from '../../../libs/auth';

type SearchDialogComponentProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const handleShellExecute: ShellExecuteHandler = async (type, target, args) => {
  const response = await authFetch(API_ENDPOINTS.SHELL_EXECUTE, {
    method: HTTP_METHOD.POST,
    headers: {
      ...HTTP_HEADERS.CONTENT_TYPE.JSON,
    },
    body: JSON.stringify({ type, target, args }),
  });

  if (!response.ok) {
    console.error('Failed to execute shell command');
  }
};

export function SearchDialogComponent({
  open,
  onOpenChange,
}: SearchDialogComponentProps) {
  return (
    <QuickLinksDialog
      links={QUICK_LINKS}
      open={open}
      onOpenChange={onOpenChange}
      onShellExecute={handleShellExecute}
    />
  );
}
