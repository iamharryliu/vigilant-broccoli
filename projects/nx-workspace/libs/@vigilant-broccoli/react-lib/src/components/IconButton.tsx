import {
  ArrowLeft,
  Bell,
  Bot,
  Check,
  Copy,
  Download,
  EllipsisVertical,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Mic,
  Minimize2,
  Minus,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  Send,
  SendHorizontal,
  Share2,
  Square,
  Sun,
  Trash,
  Waypoints,
  X,
  type LucideIcon,
} from 'lucide-react';
import { ComponentProps, forwardRef } from 'react';
import { Button } from './Button';

export const ICON_BUTTON_ICONS = {
  x: X,
  'arrow-left': ArrowLeft,
  filter: Filter,
  plus: Plus,
  minus: Minus,
  trash: Trash,
  play: Play,
  pause: Pause,
  'external-link': ExternalLink,
  search: Search,
  image: ImageIcon,
  light: Sun,
  dark: Moon,
  copy: Copy,
  check: Check,
  download: Download,
  mic: Mic,
  stop: Square,
  send: Send,
  'send-horizontal': SendHorizontal,
  'rotate-ccw': RotateCcw,
  maximize: Maximize2,
  minimize: Minimize2,
  'ellipsis-horizontal': MoreHorizontal,
  'ellipsis-vertical': EllipsisVertical,
  graph: Waypoints,
  printer: Printer,
  share: Share2,
  'qr-code': QrCode,
  bell: Bell,
  bot: Bot,
} as const satisfies Record<string, LucideIcon>;

export type IconButtonIcon = keyof typeof ICON_BUTTON_ICONS;

// Icon-only buttons have no text, so callers that skip `aria-label` still get
// an accessible name and a hover hint.
const ICON_BUTTON_DEFAULT_LABELS = {
  x: 'Close',
  'arrow-left': 'Back',
  filter: 'Filter',
  plus: 'Add',
  minus: 'Remove',
  trash: 'Delete',
  play: 'Play',
  pause: 'Pause',
  'external-link': 'Open in new tab',
  search: 'Search',
  image: 'Image',
  light: 'Switch to light mode',
  dark: 'Switch to dark mode',
  copy: 'Copy',
  check: 'Done',
  download: 'Download',
  mic: 'Start recording',
  stop: 'Stop',
  send: 'Send',
  'send-horizontal': 'Send',
  'rotate-ccw': 'Reset',
  maximize: 'Maximize',
  minimize: 'Minimize',
  'ellipsis-horizontal': 'More options',
  'ellipsis-vertical': 'More options',
  graph: 'Graph',
  printer: 'Print',
  share: 'Share',
  'qr-code': 'QR code',
  bell: 'Notifications',
  bot: 'Assistant',
} as const satisfies Record<IconButtonIcon, string>;

const DEFAULT_ICON_SIZE = 16;

type ButtonProps = ComponentProps<typeof Button>;

type IconButtonProps = Omit<ButtonProps, 'children'> & {
  icon: IconButtonIcon;
  iconSize?: number;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      iconSize = DEFAULT_ICON_SIZE,
      size = 'icon',
      'aria-label': ariaLabel,
      title,
      ...props
    },
    ref,
  ) => {
    const Icon = ICON_BUTTON_ICONS[icon];
    const label = ariaLabel ?? title ?? ICON_BUTTON_DEFAULT_LABELS[icon];
    return (
      <Button
        ref={ref}
        size={size}
        aria-label={label}
        title={title ?? label}
        {...props}
      >
        <Icon size={iconSize} />
      </Button>
    );
  },
);
IconButton.displayName = 'IconButton';
