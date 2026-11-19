import { useState } from 'react';
import {
  Button,
  CopyPastable,
  DeleteItemConfirmationDialog,
  DownloadButton,
  DropdownMenu,
  EllipsisCTA,
  Input,
  KeyboardAccessoryToolbar,
  Popover,
  SearchInput,
  SignOutButton,
  SpeechToTextToggleButton,
  Text,
  ThemePreferenceControl,
  ToggleGroup,
  ToggleGroupItem,
  UPTIME_STATUS,
  UpptimeStatusList,
  type UpptimeSummary,
} from '@vigilant-broccoli/react-lib';
import { toast, Toaster } from '@vigilant-broccoli/react-lib/toaster';

const notify = (message: string) => () => {
  toast(message);
};

export const CopyPastableDemo = () => (
  <div className="max-w-md">
    <CopyPastable text="npx nx run component-library:serve" />
  </div>
);

export const DeleteItemConfirmationDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Toaster />
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete item
      </Button>
      <DeleteItemConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        deleteItem={async () => {
          toast('Deleted');
        }}
      />
    </>
  );
};

export const DownloadButtonDemo = () => (
  <>
    <Toaster />
    <DownloadButton
      actions={[
        { label: 'Download PDF', onSelect: notify('PDF') },
        { label: 'Download Markdown', onSelect: notify('Markdown') },
      ]}
    />
  </>
);

export const DropdownMenuDemo = () => (
  <>
    <Toaster />
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="outline">Open menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={notify('Edit')}>Edit</DropdownMenu.Item>
        <DropdownMenu.Item onSelect={notify('Duplicate')}>
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onSelect={notify('Delete')}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </>
);

export const EllipsisCTADemo = () => (
  <>
    <Toaster />
    <EllipsisCTA
      onUpdate={notify('Edit')}
      onDelete={notify('Deleted')}
      actions={[{ label: 'Duplicate', onSelect: notify('Duplicate') }]}
    />
  </>
);

export const KeyboardAccessoryToolbarDemo = () => (
  <div className="flex max-w-md flex-col gap-2">
    <Text size="2" color="gray">
      Focus the field on a touch device to show the keyboard accessory keys.
    </Text>
    <Input placeholder="Type here" />
    <KeyboardAccessoryToolbar />
  </div>
);

export const PopoverDemo = () => (
  <Popover.Root>
    <Popover.Trigger>
      <Button variant="outline">Open popover</Button>
    </Popover.Trigger>
    <Popover.Content>
      <Text size="2">Popover content.</Text>
    </Popover.Content>
  </Popover.Root>
);

export const SearchInputDemo = () => {
  const [value, setValue] = useState('');
  return (
    <div className="max-w-xs">
      <SearchInput
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder="Search..."
      />
    </div>
  );
};

export const SpeechToTextToggleButtonDemo = () => {
  const [isRecording, setIsRecording] = useState(false);
  return (
    <SpeechToTextToggleButton
      isRecording={isRecording}
      onToggle={() => setIsRecording(recording => !recording)}
    />
  );
};

const SIGN_OUT_DELAY_MS = 1500;

export const SignOutButtonDemo = () => (
  <>
    <Toaster />
    <div className="flex flex-wrap items-center gap-3">
      <SignOutButton onClick={notify('Signed out')} />
      <SignOutButton
        label="Sign out (async)"
        onClick={async () => {
          await new Promise(resolve => setTimeout(resolve, SIGN_OUT_DELAY_MS));
          toast('Signed out');
        }}
      />
    </div>
  </>
);

export const ThemePreferenceControlDemo = () => (
  <div className="flex max-w-md flex-col gap-3">
    <ThemePreferenceControl />
    <ThemePreferenceControl fullWidth />
  </div>
);

const TOGGLE_OPTIONS = ['Day', 'Week', 'Month'];

export const ToggleGroupDemo = () => {
  const [value, setValue] = useState(TOGGLE_OPTIONS[0]);
  return (
    <div className="flex flex-col items-start gap-2">
      <ToggleGroup label="Range" value={value} onValueChange={setValue}>
        {TOGGLE_OPTIONS.map(option => (
          <ToggleGroupItem key={option} value={option} label={option}>
            {option}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Text size="2" color="gray">
        Selected: {value}
      </Text>
    </div>
  );
};

const UPPTIME_SUMMARY: UpptimeSummary = {
  services: [
    {
      name: 'Bookmarks',
      url: 'https://example.com/bookmarks',
      status: UPTIME_STATUS.UP,
      uptimeDay: '100%',
      uptimeWeek: '99.9%',
      uptimeMonth: '99.8%',
      uptimeYear: '99.7%',
    },
    {
      name: 'API',
      url: 'https://example.com/api',
      status: UPTIME_STATUS.DEGRADED,
      uptimeDay: '98.2%',
      uptimeWeek: '99.1%',
      uptimeMonth: '99.4%',
      uptimeYear: '99.5%',
    },
    {
      name: 'Docs',
      url: 'https://example.com/docs',
      status: UPTIME_STATUS.DOWN,
      uptimeDay: '91.0%',
      uptimeWeek: '97.5%',
      uptimeMonth: '98.9%',
      uptimeYear: '99.2%',
    },
  ],
  error: null,
  lastModified: new Date(),
};

export const UpptimeStatusListDemo = () => (
  <div className="max-w-xl">
    <UpptimeStatusList summary={UPPTIME_SUMMARY} />
  </div>
);
