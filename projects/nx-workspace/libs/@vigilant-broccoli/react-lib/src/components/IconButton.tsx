import {
  ArrowLeft,
  Check,
  Copy,
  EllipsisVertical,
  Filter,
  Image as ImageIcon,
  Maximize2,
  Mic,
  Minimize2,
  Minus,
  Moon,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Send,
  SendHorizontal,
  Square,
  Sun,
  Trash,
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
  search: Search,
  image: ImageIcon,
  light: Sun,
  dark: Moon,
  copy: Copy,
  check: Check,
  mic: Mic,
  stop: Square,
  send: Send,
  'send-horizontal': SendHorizontal,
  'rotate-ccw': RotateCcw,
  maximize: Maximize2,
  minimize: Minimize2,
  'ellipsis-horizontal': MoreHorizontal,
  'ellipsis-vertical': EllipsisVertical,
} as const satisfies Record<string, LucideIcon>;

export type IconButtonIcon = keyof typeof ICON_BUTTON_ICONS;

const DEFAULT_ICON_SIZE = 16;

type ButtonProps = ComponentProps<typeof Button>;

type IconButtonProps = Omit<ButtonProps, 'children'> & {
  icon: IconButtonIcon;
  iconSize?: number;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, iconSize = DEFAULT_ICON_SIZE, size = 'icon', ...props }, ref) => {
    const Icon = ICON_BUTTON_ICONS[icon];
    return (
      <Button ref={ref} size={size} {...props}>
        <Icon size={iconSize} />
      </Button>
    );
  },
);
IconButton.displayName = 'IconButton';
