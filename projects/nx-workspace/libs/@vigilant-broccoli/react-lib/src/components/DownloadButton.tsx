import { DropdownMenu } from '@radix-ui/themes';
import { IconButton } from './IconButton';

export type DownloadAction = {
  label: string;
  onSelect: () => void | Promise<void>;
};

export const DownloadButton = ({ actions }: { actions: DownloadAction[] }) => (
  <div onClick={e => e.stopPropagation()}>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" icon="download" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {actions.map((action, idx) => (
          <DropdownMenu.Item
            key={`${action.label}-${idx}`}
            onSelect={() => void action.onSelect()}
          >
            {action.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
);
