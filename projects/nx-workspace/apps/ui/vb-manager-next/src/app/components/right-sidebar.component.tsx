'use client';

import { IconButton } from '@radix-ui/themes';
import {
  MessageCircle,
  Mail,
  Search,
  Moon,
  Sun,
  Calendar,
  StickyNote,
  Timer,
} from 'lucide-react';
import { useTheme } from '../theme-context';

const BUTTON_STYLE = {
  cursor: 'pointer' as const,
  transition: 'transform 0.2s ease',
};

const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = 'scale(1.1)';
};

const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.transform = 'scale(1)';
};

type Props = {
  setChatbotDialogOpen: (open: boolean) => void;
  setEmailDialogOpen: (open: boolean) => void;
  setCalendarDialogOpen: (open: boolean) => void;
  setNotepadDialogOpen: (open: boolean) => void;
  setPomodoroDialogOpen: (open: boolean) => void;
  setSearchDialogOpen: (open: boolean) => void;
};

export const RightSidebar = ({
  setChatbotDialogOpen,
  setEmailDialogOpen,
  setCalendarDialogOpen,
  setNotepadDialogOpen,
  setPomodoroDialogOpen,
  setSearchDialogOpen,
}: Props) => {
  const { appearance, toggleTheme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        padding: '0.75rem 0.5rem',
        borderLeft: '1px solid var(--gray-4)',
        minWidth: '48px',
        alignSelf: 'stretch',
        overflowY: 'auto',
      }}
    >
      <IconButton
        onClick={() => setChatbotDialogOpen(true)}
        variant="ghost"
        size="2"
        title="Jarvis (C)"
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <MessageCircle size={18} />
      </IconButton>

      <IconButton
        onClick={() => setEmailDialogOpen(true)}
        variant="ghost"
        size="2"
        title="Email (M)"
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Mail size={18} />
      </IconButton>

      <IconButton
        onClick={() => setCalendarDialogOpen(true)}
        variant="ghost"
        size="2"
        title="Calendar (Shift+C)"
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Calendar size={18} />
      </IconButton>

      <IconButton
        onClick={() => setNotepadDialogOpen(true)}
        variant="ghost"
        size="2"
        title="Notepad (N)"
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <StickyNote size={18} />
      </IconButton>

      <IconButton
        onClick={() => setPomodoroDialogOpen(true)}
        variant="ghost"
        size="2"
        title="Pomodoro (Shift+P)"
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Timer size={18} />
      </IconButton>

      <IconButton
        onClick={() => setSearchDialogOpen(true)}
        variant="ghost"
        size="2"
        title="Search (/)"
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Search size={18} />
      </IconButton>

      <IconButton
        onClick={toggleTheme}
        variant="ghost"
        size="2"
        title={appearance === 'light' ? 'Dark mode (D)' : 'Light mode (D)'}
        style={BUTTON_STYLE}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {appearance === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </IconButton>
    </div>
  );
};
