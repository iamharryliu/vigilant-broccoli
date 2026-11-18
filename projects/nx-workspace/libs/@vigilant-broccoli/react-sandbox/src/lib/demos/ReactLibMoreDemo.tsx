import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Button,
  Callout,
  CalloutIcon,
  CalloutText,
  CardSkeleton,
  ClearableInput,
  ContextMenu,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmbedDialog,
  HighlightMatch,
  ImageCropDialog,
  Input,
  MultiSelect,
  Progress,
  ScrollArea,
  Skeleton,
  StackedImages,
  TeamAvatar,
  Text,
} from '@vigilant-broccoli/react-lib';
import { toast, Toaster } from '@vigilant-broccoli/react-lib/toaster';

const notify = (message: string) => () => {
  toast(message);
};

const placeholderImage = (color: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="white" font-size="96" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )}`;

const SAMPLE_IMAGES = [
  placeholderImage('#3b82f6', 'A'),
  placeholderImage('#10b981', 'B'),
  placeholderImage('#f59e0b', 'C'),
];

export const CalloutDemo = () => (
  <div className="flex max-w-md flex-col gap-2">
    {(['gray', 'blue', 'green', 'red'] as const).map(color => (
      <Callout key={color} color={color}>
        <CalloutIcon>
          <Info size={16} />
        </CalloutIcon>
        <CalloutText>A {color} callout.</CalloutText>
      </Callout>
    ))}
  </div>
);

export const ClearableInputDemo = () => {
  const [value, setValue] = useState('Clear me');
  return (
    <div className="max-w-xs">
      <ClearableInput
        value={value}
        onChange={event => setValue(event.target.value)}
        onClear={() => setValue('')}
        placeholder="Type something"
      />
    </div>
  );
};

export const ContextMenuDemo = () => (
  <>
    <Toaster />
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <div className="flex h-32 max-w-sm items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          Right-click here
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={notify('Open')}>Open</ContextMenu.Item>
        <ContextMenu.Item onSelect={notify('Rename')}>Rename</ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" onSelect={notify('Delete')}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  </>
);

export const DialogDemo = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Open dialog</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Dialog title</DialogTitle>
        <DialogDescription>Supporting text for the dialog.</DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);

export const EmbedDialogDemo = () => {
  const [url, setUrl] = useState<string | null>(null);
  return (
    <>
      <Button variant="outline" onClick={() => setUrl('https://example.com')}>
        Open embed
      </Button>
      <EmbedDialog
        title="example.com"
        url={url}
        onOpenChange={open => !open && setUrl(null)}
      />
    </>
  );
};

export const HighlightMatchDemo = () => {
  const [query, setQuery] = useState('quick');
  return (
    <div className="flex max-w-md flex-col gap-2">
      <Input
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="Query"
      />
      <Text size="2">
        <HighlightMatch
          text="The quick brown fox jumps over the lazy dog"
          query={query}
        />
      </Text>
    </div>
  );
};

export const ImageCropDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Toaster />
      <Button variant="outline" onClick={() => setOpen(true)}>
        Crop image
      </Button>
      <ImageCropDialog
        open={open}
        imageSrc={SAMPLE_IMAGES[0]}
        onOpenChange={setOpen}
        onSave={async () => {
          toast('Saved crop');
          setOpen(false);
        }}
      />
    </>
  );
};

const FRUIT_OPTIONS = [
  { id: 1, name: 'Apple' },
  { id: 2, name: 'Banana' },
  { id: 3, name: 'Cherry' },
];

export const MultiSelectDemo = () => {
  const [values, setValues] = useState<string[]>(['1']);
  return (
    <MultiSelect
      options={FRUIT_OPTIONS}
      values={values}
      onValueChange={setValues}
      displayKey="name"
      placeholder="Pick fruit"
      showSelection
    />
  );
};

export const ProgressDemo = () => (
  <div className="flex max-w-sm flex-col gap-3">
    {[25, 60, 100].map(value => (
      <Progress key={value} value={value} />
    ))}
  </div>
);

export const ScrollAreaDemo = () => (
  <ScrollArea className="h-40 max-w-xs rounded-lg border border-border p-3">
    {Array.from({ length: 20 }, (_, index) => (
      <Text key={index} size="2" className="block">
        Row {index + 1}
      </Text>
    ))}
  </ScrollArea>
);

export const SkeletonDemo = () => (
  <div className="flex max-w-sm flex-col gap-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <CardSkeleton title="Card skeleton" rows={2} />
  </div>
);

export const StackedImagesDemo = () => <StackedImages urls={SAMPLE_IMAGES} />;

export const TeamAvatarDemo = () => (
  <div className="flex items-center gap-3">
    <TeamAvatar name="Design" />
    <TeamAvatar name="Engineering" />
    <TeamAvatar name="Sales" avatarUrl={SAMPLE_IMAGES[1]} />
  </div>
);
