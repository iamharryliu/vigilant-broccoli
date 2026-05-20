'use client';

import React from 'react';
import {
  Sidebar,
  SidebarCTA,
  useTheme,
} from '@vigilant-broccoli/react-lib';
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

const LIGHT = 'light';
const DARK_MODE_LABEL = 'Dark mode';
const LIGHT_MODE_LABEL = 'Light mode';
const THEME_SHORTCUT = ' (D)';

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
  const isLight = appearance === LIGHT;
  const themeLabel = isLight ? DARK_MODE_LABEL : LIGHT_MODE_LABEL;

  const items: SidebarCTA[] = [
    {
      label: 'Jarvis',
      icon: MessageCircle,
      title: 'Jarvis (C)',
      onClick: () => setChatbotDialogOpen(true),
    },
    {
      label: 'Email',
      icon: Mail,
      title: 'Email (M)',
      onClick: () => setEmailDialogOpen(true),
    },
    {
      label: 'Calendar',
      icon: Calendar,
      title: 'Calendar (Shift+C)',
      onClick: () => setCalendarDialogOpen(true),
    },
    {
      label: 'Notepad',
      icon: StickyNote,
      title: 'Notepad (N)',
      onClick: () => setNotepadDialogOpen(true),
    },
    {
      label: 'Pomodoro',
      icon: Timer,
      title: 'Pomodoro (Shift+P)',
      onClick: () => setPomodoroDialogOpen(true),
    },
    {
      label: 'Search',
      icon: Search,
      title: 'Search (/)',
      onClick: () => setSearchDialogOpen(true),
    },
    {
      label: themeLabel,
      icon: isLight ? Moon : Sun,
      title: themeLabel + THEME_SHORTCUT,
      onClick: toggleTheme,
    },
  ];

  return <Sidebar items={items} side="right" align="space-evenly" />;
};
