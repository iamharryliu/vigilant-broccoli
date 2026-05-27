import { IconButton } from './IconButton';

type Props = {
  dark: boolean;
  onToggle: (dark: boolean) => void;
};

export const DarkModeIconButton = ({ dark, onToggle }: Props) => (
  <IconButton
    icon={dark ? 'light' : 'dark'}
    variant="ghost"
    title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    onClick={() => onToggle(!dark)}
  />
);
