import { MouseEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Blocks,
  CalendarDays,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  KeyRound,
  Layers,
  LayoutGrid,
  Link2,
  List,
  ListChecks,
  Menu,
  MessageSquare,
  Music,
  Package,
  PanelLeft,
  Search,
  Settings as SettingsIcon,
  Trophy,
  Type as TypeIcon,
  Wrench,
} from 'lucide-react';
import {
  ButtonList,
  ThemePreferenceControl,
  ThemeProvider,
  useDocumentTitle,
  Switch,
  Heading,
  Text,
} from '@vigilant-broccoli/react-lib';
import { Sidebar, SidebarCTA } from '@vigilant-broccoli/sidebar';
import {
  AlarmUtilityContent,
  CalculatorUtilityContent,
  CookingConversionsUtilityContent,
  CurrencyConverterUtilityContent,
  PomodoroEngine,
  PomodoroUtilityContent,
  QrReaderUtilityContent,
  StopwatchUtilityContent,
  TimerUtilityContent,
} from '@vigilant-broccoli/react-utility';
import { AlertDialogDemo } from './demos/AlertDialogDemo';
import { AudioButtonDemo } from './demos/AudioButtonDemo';
import { CalendarListDemo } from './demos/CalendarListDemo';
import { GoogleSignInPageDemo } from './demos/GoogleSignInPageDemo';
import { ImageCarouselDemo } from './demos/ImageCarouselDemo';
import { ImageGalleryDemo } from './demos/ImageGalleryDemo';
import { MetronomeDemo } from './demos/MetronomeDemo';
import {
  I18nProvider as SandboxI18nProvider,
  useTranslation as useSandboxTranslation,
} from './i18n';
import sandboxEn from './i18n/en.json';
import { InputDemo, TextareaDemo } from './demos/InputDemo';
import { CheckboxDemo } from './demos/CheckboxDemo';
import { BadgeDemo } from './demos/BadgeDemo';
import { CardDemo } from './demos/CardDemo';
import { TypographyDemo } from './demos/TypographyDemo';
import { SegmentedControlDemo } from './demos/SegmentedControlDemo';
import { AvatarDemo } from './demos/AvatarDemo';
import { UserAvatarDemo } from './demos/UserAvatarDemo';
import { ButtonDemo } from './demos/ButtonDemo';
import { IconButtonDemo } from './demos/IconButtonDemo';
import { ButtonListDemo } from './demos/ButtonListDemo';
import { BUILT_WITH } from './built-with';
import { EntryDirectoryDemo } from './demos/EntryDirectoryDemo';
import {
  CopyPastableDemo,
  DeleteItemConfirmationDialogDemo,
  DownloadButtonDemo,
  DropdownMenuDemo,
  EllipsisCTADemo,
  KeyboardAccessoryToolbarDemo,
  PopoverDemo,
  SearchInputDemo,
  SpeechToTextToggleButtonDemo,
  ThemePreferenceControlDemo,
  ToggleGroupDemo,
  UpptimeStatusListDemo,
} from './demos/ReactLibExtrasDemo';
import {
  ChatPanelDemo,
  PreviewDeploymentsDemo,
  SecurityNewsListDemo,
  WeatherEmbedCardDemo,
} from './demos/HigherLevelExtrasDemo';
import {
  CalendarEventDetailsDemo,
  CreateCalendarEventDialogDemo,
} from './demos/CalendarExtrasDemo';
import { DocsViewerDemo, GraphViewDemo } from './demos/DocsViewerDemo';
import { FileExplorerDemo } from './demos/FileExplorerDemo';
import {
  ChatHistorySidebarDemo,
  ChatInputAreaDemo,
  ChatMessagesAreaDemo,
  ConfirmDeleteDialogDemo,
} from './demos/ChatbotDemo';
import {
  CalloutDemo,
  ClearableInputDemo,
  ContextMenuDemo,
  DialogDemo,
  EmbedDialogDemo,
  HighlightMatchDemo,
  ImageCropDialogDemo,
  MultiSelectDemo,
  ProgressDemo,
  ScrollAreaDemo,
  SkeletonDemo,
  StackedImagesDemo,
  TeamAvatarDemo,
} from './demos/ReactLibMoreDemo';
import { CheckListDemo } from './demos/CheckListDemo';
import { CollapsibleListItemDemo } from './demos/CollapsibleListItemDemo';
import { CRUDListNoImagesDemo } from './demos/CRUDListNoImagesDemo';
import { WeatherClockCardDemo } from './demos/WeatherClockCardDemo';
import { CRUDListWithImagesDemo } from './demos/CRUDListWithImagesDemo';
import { DocsExplorerDemo } from './demos/DocsExplorerDemo';
import { MarkdownViewerDemo } from './demos/MarkdownViewerDemo';
import { SelectDemo } from './demos/SelectDemo';
import { ErrorDemo } from './demos/ErrorDemo';
import { GithubActionsBadgesDemo } from './demos/GithubActionsBadgesDemo';
import { StatusCardListDemo } from './demos/StatusCardListDemo';
import { TabsDemo } from './demos/TabsDemo';
import { TooltipDemo } from './demos/TooltipDemo';
import { LinkCardDemo } from './demos/LinkCardDemo';
import { SwitchDemo } from './demos/SwitchDemo';
import { ToasterDemo } from './demos/ToasterDemo';
import { UserLeaderboardDemo } from './demos/UserLeaderboardDemo';
import { GroupLeaderboardDemo } from './demos/GroupLeaderboardDemo';
import { EmptyLeaderboardDemo } from './demos/EmptyLeaderboardDemo';
import { MobileHomeDemo } from './demos/MobileHomeDemo';
import { NotepadDemo } from './demos/NotepadDemo';
import { QuickLinksDemo } from './demos/QuickLinksDemo';
import { ScrollTimelineDemo } from './demos/ScrollTimelineDemo';
import { TasksDemo } from './demos/TasksDemo';

const CRUD_STORAGE_KEYS = {
  IS_CARDS: 'component-sandbox-crud-is-cards',
  SHOW_ELLIPSIS: 'component-sandbox-crud-show-ellipsis',
  FULL_WIDTH_IMAGE: 'component-sandbox-crud-full-width-image',
};

const CRUD_SWITCH_LABEL = {
  CARDS: 'Cards',
  ELLIPSIS: 'Ellipsis',
  FULL_WIDTH_IMAGE: 'Full-width image',
} as const;

// Not an entry id, so it can share the selection state; served at `/`.
const OVERVIEW_ID = 'components';
const OVERVIEW_LABEL = 'Components';
// Typography is a foundation rather than a component, so it sits above
// Components in the sidebar instead of inside the react-lib group.
const TYPOGRAPHY_ID = 'typography';

// Not an entry id either; served at `/settings` and only when the sandbox owns
// its ThemeProvider (`wrapInTheme`).
const SETTINGS_ID = 'settings';
const SETTINGS_LABEL = 'Settings';

const PACKAGE_SCOPE_GROUP_ID = '@vigilant-broccoli';
const PACKAGE_SCOPE = `${PACKAGE_SCOPE_GROUP_ID}/`;

// Declaration order is sidebar order: low-level libs first.
const LIB = {
  REACT_LIB: 'react-lib',
  HIGHER_LEVEL: 'react-lib-higher-level',
  ENTRY_DIRECTORY: 'entry-directory',
  SIDEBAR: 'sidebar',
  QUICK_LINKS: 'react-lib-quick-links',
  DOCS_EXPLORER: 'docs-explorer',
  FILE_EXPLORER: 'file-explorer',
  CHATBOT: 'chatbot',
  CALENDAR: 'react-lib-calendar',
  CRUD_LIST: 'react-lib-crud-list',
  TASKS: 'react-lib-tasks',
  AUTH: 'react-lib-auth',
  MEDIA: 'react-lib-media',
  LEADERBOARD: 'leaderboard',
  MUSIC: 'react-music-lib',
  UTILITY: 'react-utility',
} as const;
type Lib = (typeof LIB)[keyof typeof LIB];
const LIB_ICON = {
  [LIB.REACT_LIB]: Blocks,
  [LIB.HIGHER_LEVEL]: Layers,
  [LIB.ENTRY_DIRECTORY]: Search,
  [LIB.SIDEBAR]: PanelLeft,
  [LIB.QUICK_LINKS]: Link2,
  [LIB.DOCS_EXPLORER]: FileText,
  [LIB.FILE_EXPLORER]: FolderOpen,
  [LIB.CHATBOT]: MessageSquare,
  [LIB.CALENDAR]: CalendarDays,
  [LIB.CRUD_LIST]: List,
  [LIB.TASKS]: ListChecks,
  [LIB.AUTH]: KeyRound,
  [LIB.MEDIA]: ImageIcon,
  [LIB.LEADERBOARD]: Trophy,
  [LIB.MUSIC]: Music,
  [LIB.UTILITY]: Wrench,
} as const;

interface SandboxEntry {
  id: string;
  label: string;
  description: string;
  lib: Lib;
  foundationKey?: keyof typeof sandboxEn.FOUNDATIONS;
  content: ReactNode;
}

const CRUDListSection = () => {
  const [isCards, setIsCards] = useState(false);
  const [showEllipsis, setShowEllipsis] = useState(true);
  const [fullWidthImage, setFullWidthImage] = useState(false);

  useEffect(() => {
    setIsCards(localStorage.getItem(CRUD_STORAGE_KEYS.IS_CARDS) === 'true');
    setShowEllipsis(
      localStorage.getItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS) !== 'false',
    );
    setFullWidthImage(
      localStorage.getItem(CRUD_STORAGE_KEYS.FULL_WIDTH_IMAGE) === 'true',
    );
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={isCards}
            onCheckedChange={v => {
              setIsCards(v);
              localStorage.setItem(CRUD_STORAGE_KEYS.IS_CARDS, String(v));
            }}
          />
          {CRUD_SWITCH_LABEL.CARDS}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={showEllipsis}
            onCheckedChange={v => {
              setShowEllipsis(v);
              localStorage.setItem(CRUD_STORAGE_KEYS.SHOW_ELLIPSIS, String(v));
            }}
          />
          {CRUD_SWITCH_LABEL.ELLIPSIS}
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch
            checked={fullWidthImage}
            onCheckedChange={v => {
              setFullWidthImage(v);
              localStorage.setItem(
                CRUD_STORAGE_KEYS.FULL_WIDTH_IMAGE,
                String(v),
              );
            }}
          />
          {CRUD_SWITCH_LABEL.FULL_WIDTH_IMAGE}
        </label>
      </div>
      <CRUDListNoImagesDemo isCards={isCards} showEllipsis={showEllipsis} />
      <CRUDListWithImagesDemo
        isCards={isCards}
        showEllipsis={showEllipsis}
        fullWidthImage={fullWidthImage}
      />
    </div>
  );
};

const ALL_ENTRIES: SandboxEntry[] = [
  {
    id: 'alert-dialog',
    label: sandboxEn.ALERT_DIALOG.NAME,
    description: sandboxEn.ALERT_DIALOG.SUMMARY,
    lib: LIB.REACT_LIB,
    content: <AlertDialogDemo />,
  },
  {
    id: 'avatar',
    label: 'Avatar',
    description:
      'Avatar sizes, image and initial fallbacks, generated boring-avatar variants and the editable overlay.',
    lib: LIB.REACT_LIB,
    content: <AvatarDemo />,
  },
  {
    id: 'badge',
    label: sandboxEn.FOUNDATIONS.BADGE.NAME,
    description: sandboxEn.FOUNDATIONS.BADGE.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'BADGE',
    content: <BadgeDemo />,
  },
  {
    id: 'button-list',
    label: 'Button List',
    description:
      'A wrapping row of badge-style buttons with arrow-key navigation, hover focus and an inset focus ring.',
    lib: LIB.REACT_LIB,
    content: <ButtonListDemo />,
  },
  {
    id: 'buttons',
    label: 'Buttons',
    description:
      'The button set - variants, sizes, states, copy and close buttons and provider sign-in buttons.',
    lib: LIB.REACT_LIB,
    content: <ButtonDemo />,
  },
  {
    id: 'icon-button',
    label: 'Icon Button',
    description:
      'Icon-only buttons in each variant, plus the delete and dark-mode icon buttons.',
    lib: LIB.REACT_LIB,
    content: <IconButtonDemo />,
  },
  {
    id: 'card',
    label: sandboxEn.FOUNDATIONS.CARD.NAME,
    description: sandboxEn.FOUNDATIONS.CARD.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'CARD',
    content: <CardDemo />,
  },
  {
    id: 'checkbox',
    label: sandboxEn.FOUNDATIONS.CHECKBOX.NAME,
    description: sandboxEn.FOUNDATIONS.CHECKBOX.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'CHECKBOX',
    content: <CheckboxDemo />,
  },
  {
    id: 'checklist',
    label: 'Checklist',
    description:
      'Checkable rows with inline editing, drag reorder and a collapsible completed section, driven entirely by caller-supplied render props.',
    lib: LIB.REACT_LIB,
    content: <CheckListDemo />,
  },
  {
    id: 'collapsible-list-item',
    label: 'Collapsible List Item',
    description:
      'Accordion and collapsible list rows, with plain text and rich content inside.',
    lib: LIB.REACT_LIB,
    content: <CollapsibleListItemDemo />,
  },
  {
    id: 'crud-list',
    label: 'CRUD List Management',
    description:
      'List and card layouts for create/read/update/delete management, with optional images, ellipsis menus and full-width thumbnails.',
    lib: LIB.CRUD_LIST,
    content: <CRUDListSection />,
  },
  {
    id: 'empty-leaderboard',
    label: 'Empty Leaderboard',
    description:
      'The leaderboard in its loading and empty states, before any rows hydrate.',
    lib: LIB.LEADERBOARD,
    content: <EmptyLeaderboardDemo />,
  },
  {
    id: 'error',
    label: 'Error Handling',
    description:
      'Error surfaces - inline callouts, a transient alert and a blocking dialog.',
    lib: LIB.REACT_LIB,
    content: <ErrorDemo />,
  },
  {
    id: 'github-actions-badges',
    label: 'GitHub Actions Badges',
    description:
      'Workflow status badges for a repo, plain and wrapped in a card container.',
    lib: LIB.MEDIA,
    content: <GithubActionsBadgesDemo />,
  },
  {
    id: 'group-leaderboard',
    label: 'Group Leaderboard',
    description:
      'Team leaderboard with period switching, sortable metrics and polled refreshes against mock data.',
    lib: LIB.LEADERBOARD,
    content: <GroupLeaderboardDemo />,
  },
  {
    id: 'scroll-timeline',
    label: 'Scroll Timeline',
    description:
      'A running balance timeline, scroll-linked to a series of dated entries.',
    lib: LIB.REACT_LIB,
    content: <ScrollTimelineDemo />,
  },
  {
    id: 'input',
    label: sandboxEn.FOUNDATIONS.INPUT.NAME,
    description: sandboxEn.FOUNDATIONS.INPUT.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'INPUT',
    content: <InputDemo />,
  },
  {
    id: 'textarea',
    label: sandboxEn.FOUNDATIONS.TEXTAREA.NAME,
    description: sandboxEn.FOUNDATIONS.TEXTAREA.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'TEXTAREA',
    content: <TextareaDemo />,
  },
  {
    id: 'link-card',
    label: 'Link Card',
    description:
      'Clickable card with title, description and icon, with a subtle lift on hover; renders an anchor or a router link.',
    lib: LIB.REACT_LIB,
    content: <LinkCardDemo />,
  },
  {
    id: 'segmented-control',
    label: sandboxEn.FOUNDATIONS.SEGMENTED_CONTROL.NAME,
    description: sandboxEn.FOUNDATIONS.SEGMENTED_CONTROL.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'SEGMENTED_CONTROL',
    content: <SegmentedControlDemo />,
  },
  {
    id: 'select',
    label: 'Select',
    description:
      'Select bound to string, number and object options, each with its own selected-value rendering.',
    lib: LIB.REACT_LIB,
    content: <SelectDemo />,
  },
  {
    id: 'status-card-list',
    label: 'Status Card List',
    description:
      'Status rows with badges, monospace detail text and per-row actions, flat or grouped.',
    lib: LIB.REACT_LIB,
    content: <StatusCardListDemo />,
  },
  {
    id: 'switch',
    label: 'Switch',
    description:
      'Switch in its default, checked, disabled and controlled forms.',
    lib: LIB.REACT_LIB,
    content: <SwitchDemo />,
  },
  {
    id: 'tabs',
    label: 'Tabs',
    description:
      'Tabs with panel content, driven by the react-lib shim over the underlying primitive.',
    lib: LIB.REACT_LIB,
    content: <TabsDemo />,
  },
  {
    id: 'toggle-group',
    label: 'Toggle Group',
    description:
      'Single-select group with a sliding pill and radiogroup arrow-key navigation; the base of Segmented Control and the Tabs list.',
    lib: LIB.REACT_LIB,
    content: <ToggleGroupDemo />,
  },
  {
    id: 'theme-preference-control',
    label: 'Theme Preference Control',
    description:
      "System/Light/Dark picker bound to the surrounding ThemeProvider; here it switches this sandbox's theme.",
    lib: LIB.REACT_LIB,
    content: <ThemePreferenceControlDemo />,
  },
  {
    id: 'toaster',
    label: 'Toaster',
    description:
      'Toast notifications - info, success, warning, error and promise-driven toasts.',
    lib: LIB.REACT_LIB,
    content: <ToasterDemo />,
  },
  {
    id: 'tooltip',
    label: 'Tooltip',
    description:
      'Tooltips on each side of a trigger, with the provider wiring they need.',
    lib: LIB.REACT_LIB,
    content: <TooltipDemo />,
  },
  {
    id: 'typography',
    label: sandboxEn.FOUNDATIONS.TYPOGRAPHY.NAME,
    description: sandboxEn.FOUNDATIONS.TYPOGRAPHY.SUMMARY,
    lib: LIB.REACT_LIB,
    foundationKey: 'TYPOGRAPHY',
    content: <TypographyDemo />,
  },
  {
    id: 'user-avatar',
    label: 'User Avatar',
    description:
      'The user avatar with upload handling, generated variants and the states around a pending image.',
    lib: LIB.REACT_LIB,
    content: <UserAvatarDemo />,
  },
  {
    id: 'user-leaderboard',
    label: 'User Leaderboard',
    description:
      'User leaderboard with sortable metrics, column toggles, paging and live rank changes.',
    lib: LIB.LEADERBOARD,
    content: <UserLeaderboardDemo />,
  },
  {
    id: 'alarm',
    label: 'Alarm',
    description:
      'Set alarms that persist locally and fire with an audible alert.',
    lib: LIB.UTILITY,
    content: <AlarmUtilityContent />,
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    description:
      'Focus and break timer that survives reloads, with alerts and browser notifications.',
    lib: LIB.UTILITY,
    content: (
      <>
        <PomodoroEngine />
        <PomodoroUtilityContent />
      </>
    ),
  },
  {
    id: 'calculator',
    label: 'Calculator',
    description: 'Basic arithmetic calculator with a keyboard-driven keypad.',
    lib: LIB.UTILITY,
    content: <CalculatorUtilityContent />,
  },
  {
    id: 'cooking-conversions',
    label: 'Cooking Conversions',
    description:
      'Convert between cooking volumes, weights and temperatures, both directions.',
    lib: LIB.UTILITY,
    content: <CookingConversionsUtilityContent />,
  },
  {
    id: 'currency-converter',
    label: 'Currency Converter',
    description:
      'Convert between currencies against live rates, with a locally stored conversion history.',
    lib: LIB.UTILITY,
    content: <CurrencyConverterUtilityContent />,
  },
  {
    id: 'weather-clock-card',
    label: 'Weather Clock Card',
    description:
      'Clock, weather with details, preparation badges and a day-by-day forecast carousel (click the weather tile), the next sunrise/sunset and the current moon phase. Sun times and moon phase are computed locally from the location.',
    lib: LIB.UTILITY,
    content: <WeatherClockCardDemo />,
  },
  {
    id: 'docs-explorer',
    label: 'Docs Explorer',
    description:
      'The docs explorer is the file-tree + search shell behind docs.harryliu.dev. It is not mounted here - it needs a notes tree to browse - so this page links to the live site.',
    lib: LIB.DOCS_EXPLORER,
    content: <DocsExplorerDemo />,
  },
  {
    id: 'markdown-viewer',
    label: 'Markdown Viewer',
    description:
      'Renders Markdown with sanitized HTML and mermaid diagrams. With collapsibleHeadingLevel, each heading of that level becomes a CollapsibleList item (defaultOpenSections opens the first N); the changelog page uses this for its monthly sections. Use the Custom text tab to try your own Markdown and settings.',
    lib: LIB.DOCS_EXPLORER,
    content: <MarkdownViewerDemo />,
  },
  {
    id: 'notepad',
    label: 'Notepad',
    description:
      'A synced text editor with syntax highlighting, standing in for the notepad surface.',
    lib: LIB.REACT_LIB,
    content: <NotepadDemo />,
  },
  {
    id: 'quick-links',
    label: 'Quick Links',
    description:
      'Fuzzy-searchable link launcher, as a command dialog and as an inline panel.',
    lib: LIB.QUICK_LINKS,
    content: <QuickLinksDemo />,
  },
  {
    id: 'stopwatch',
    label: 'Stopwatch',
    description: 'Stopwatch with lap splits.',
    lib: LIB.UTILITY,
    content: <StopwatchUtilityContent />,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    description:
      'Runs the shared tasks component against an in-memory tasks API with simulated latency. Voice input calls the mocked transcription and parse endpoints.',
    lib: LIB.TASKS,
    content: <TasksDemo />,
  },
  {
    id: 'timer',
    label: 'Timer',
    description: 'Countdown timer with presets and an audible finish.',
    lib: LIB.UTILITY,
    content: <TimerUtilityContent />,
  },
  {
    id: 'mobile-home',
    label: 'Mobile Home',
    description:
      'The mobile-manager-next home page inside an iPhone-sized frame: the top bar with a menu button that opens the sidebar drawer, and the pinned layout where each tab panel scrolls on its own. The tab shell, agenda, event calendars list, tasks, quick links and sidebar are the real shared components fed with sample data; the Create calendar event dialog and task voice input are mocked.',
    lib: LIB.HIGHER_LEVEL,
    content: <MobileHomeDemo />,
  },
  {
    id: 'entry-directory',
    label: 'Entry Directory',
    description:
      'Fuzzy-searchable grouped entries with Rows and Grouped views, arrow-key navigation, and favorites.',
    lib: LIB.ENTRY_DIRECTORY,
    content: <EntryDirectoryDemo />,
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    description:
      "The collapsible navigation rail on the left of this page, which becomes a drawer on narrow screens. This sandbox's own navigation is the live Sidebar.",
    lib: LIB.SIDEBAR,
    content: <Text>The Sidebar is the navigation on the left.</Text>,
  },
  {
    id: 'audio-button',
    label: 'Audio Button',
    description:
      'Speak buttons in their idle, loading and disabled-while-another-plays states, with a mocked speak handler.',
    lib: LIB.MEDIA,
    content: <AudioButtonDemo />,
  },
  {
    id: 'image-carousel',
    label: 'Image Carousel',
    description:
      'Image filmstrip thumbnails that open the full-screen carousel dialog, using local placeholder images.',
    lib: LIB.MEDIA,
    content: <ImageCarouselDemo />,
  },
  {
    id: 'image-gallery',
    label: 'Image Gallery',
    description:
      'One image list rendered as masonry, justified rows or a shuffled stack (← / → cycles it), with each image running its call to action.',
    lib: LIB.MEDIA,
    content: <ImageGalleryDemo />,
  },
  {
    id: 'calendar-list',
    label: 'Calendar List',
    description:
      'Month-by-month event list grouped by day with sample events, plus its loading skeleton.',
    lib: LIB.CALENDAR,
    content: <CalendarListDemo />,
  },
  {
    id: 'google-sign-in-page',
    label: 'Google Sign-In Page',
    description:
      'The sign-in page with a stubbed handler. It performs no real auth and never creates a Supabase client.',
    lib: LIB.AUTH,
    content: <GoogleSignInPageDemo />,
  },
  {
    id: 'metronome',
    label: 'Metronome',
    description: 'Tempo metronome with BPM controls and an audible click.',
    lib: LIB.MUSIC,
    content: <MetronomeDemo />,
  },
  {
    id: 'copy-pastable',
    label: 'Copy Pastable',
    description: 'Read-only text with a copy button.',
    lib: LIB.REACT_LIB,
    content: <CopyPastableDemo />,
  },
  {
    id: 'delete-item-confirmation-dialog',
    label: 'Delete Item Confirmation Dialog',
    description: 'In-app confirmation dialog for destructive deletes.',
    lib: LIB.REACT_LIB,
    content: <DeleteItemConfirmationDialogDemo />,
  },
  {
    id: 'download-button',
    label: 'Download Button',
    description: 'Download button with a menu of formats.',
    lib: LIB.REACT_LIB,
    content: <DownloadButtonDemo />,
  },
  {
    id: 'dropdown-menu',
    label: 'Dropdown Menu',
    description: 'Menu of actions opened from a trigger button.',
    lib: LIB.REACT_LIB,
    content: <DropdownMenuDemo />,
  },
  {
    id: 'ellipsis-cta',
    label: 'Ellipsis CTA',
    description:
      'Ellipsis menu with edit, extra actions and a confirmed delete.',
    lib: LIB.REACT_LIB,
    content: <EllipsisCTADemo />,
  },
  {
    id: 'keyboard-accessory-toolbar',
    label: 'Keyboard Accessory Toolbar',
    description:
      'Extra keys shown above the on-screen keyboard while a text field is focused on touch devices.',
    lib: LIB.REACT_LIB,
    content: <KeyboardAccessoryToolbarDemo />,
  },
  {
    id: 'popover',
    label: 'Popover',
    description: 'Floating panel anchored to a trigger.',
    lib: LIB.REACT_LIB,
    content: <PopoverDemo />,
  },
  {
    id: 'search-input',
    label: 'Search Input',
    description: 'Compact input with a leading search icon.',
    lib: LIB.REACT_LIB,
    content: <SearchInputDemo />,
  },
  {
    id: 'speech-to-text-toggle-button',
    label: 'Speech To Text Toggle Button',
    description: 'Microphone button that toggles recording.',
    lib: LIB.REACT_LIB,
    content: <SpeechToTextToggleButtonDemo />,
  },
  {
    id: 'upptime-status-list',
    label: 'Upptime Status List',
    description:
      'Service status rows with uptime ranges, fed here with sample data.',
    lib: LIB.REACT_LIB,
    content: <UpptimeStatusListDemo />,
  },
  {
    id: 'chat-panel',
    label: 'Chat Panel',
    description: 'Chat room message list and composer, with local messages.',
    lib: LIB.HIGHER_LEVEL,
    content: <ChatPanelDemo />,
  },
  {
    id: 'preview-deployments',
    label: 'Preview Deployments',
    description:
      'Open pull requests with their preview links, from sample data.',
    lib: LIB.HIGHER_LEVEL,
    content: <PreviewDeploymentsDemo />,
  },
  {
    id: 'security-news-list',
    label: 'Security News List',
    description: 'Matched security news items, from sample data.',
    lib: LIB.HIGHER_LEVEL,
    content: <SecurityNewsListDemo />,
  },
  {
    id: 'weather-embed-card',
    label: 'Weather Embed Card',
    description: 'Card that embeds the weather app.',
    lib: LIB.HIGHER_LEVEL,
    content: <WeatherEmbedCardDemo />,
  },
  {
    id: 'calendar-event-details',
    label: 'Calendar Event Details',
    description: 'Details sheet for one calendar event.',
    lib: LIB.CALENDAR,
    content: <CalendarEventDetailsDemo />,
  },
  {
    id: 'create-calendar-event-dialog',
    label: 'Create Calendar Event Dialog',
    description:
      'Dialog that turns text or images into calendar events; here any text parses to one sample event.',
    lib: LIB.CALENDAR,
    content: <CreateCalendarEventDialogDemo />,
  },
  {
    id: 'docs-viewer',
    label: 'Docs Viewer',
    description: 'Markdown docs browser over a small in-memory tree.',
    lib: LIB.DOCS_EXPLORER,
    content: <DocsViewerDemo />,
  },
  {
    id: 'graph-view',
    label: 'Graph View',
    description: 'Force-directed graph of linked notes.',
    lib: LIB.DOCS_EXPLORER,
    content: <GraphViewDemo />,
  },
  {
    id: 'qr-reader',
    label: 'QR Reader',
    description: 'Reads a QR code from an uploaded image.',
    lib: LIB.UTILITY,
    content: <QrReaderUtilityContent uploadOnly />,
  },
  {
    id: 'file-explorer',
    label: 'File Explorer',
    description: 'File browser over an in-memory sample tree.',
    lib: LIB.FILE_EXPLORER,
    content: <FileExplorerDemo />,
  },
  {
    id: 'chat-messages-area',
    label: 'Chat Messages Area',
    description: 'Chatbot conversation with Markdown and message actions.',
    lib: LIB.CHATBOT,
    content: <ChatMessagesAreaDemo />,
  },
  {
    id: 'chat-input-area',
    label: 'Chat Input Area',
    description: 'Chatbot composer with image upload and send.',
    lib: LIB.CHATBOT,
    content: <ChatInputAreaDemo />,
  },
  {
    id: 'chat-history-sidebar',
    label: 'Chat History Sidebar',
    description: 'Chat list with pinning, renaming and delete.',
    lib: LIB.CHATBOT,
    content: <ChatHistorySidebarDemo />,
  },
  {
    id: 'confirm-delete-dialog',
    label: 'Confirm Delete Dialog',
    description: "The chatbot's confirmation dialog for deleting a chat.",
    lib: LIB.CHATBOT,
    content: <ConfirmDeleteDialogDemo />,
  },
  {
    id: 'callout',
    label: 'Callout',
    description: 'Inline notice with an icon, in each color.',
    lib: LIB.REACT_LIB,
    content: <CalloutDemo />,
  },
  {
    id: 'clearable-input',
    label: 'Clearable Input',
    description: 'Input with a clear button once it has a value.',
    lib: LIB.REACT_LIB,
    content: <ClearableInputDemo />,
  },
  {
    id: 'context-menu',
    label: 'Context Menu',
    description: 'Right-click menu of actions.',
    lib: LIB.REACT_LIB,
    content: <ContextMenuDemo />,
  },
  {
    id: 'dialog',
    label: 'Dialog',
    description: 'Modal dialog with a header, opened from a trigger.',
    lib: LIB.REACT_LIB,
    content: <DialogDemo />,
  },
  {
    id: 'embed-dialog',
    label: 'Embed Dialog',
    description: 'Dialog that embeds a page in an iframe.',
    lib: LIB.REACT_LIB,
    content: <EmbedDialogDemo />,
  },
  {
    id: 'highlight-match',
    label: 'Highlight Match',
    description: 'Text with the parts matching a query highlighted.',
    lib: LIB.REACT_LIB,
    content: <HighlightMatchDemo />,
  },
  {
    id: 'image-crop-dialog',
    label: 'Image Crop Dialog',
    description: 'Dialog for cropping an image before saving it.',
    lib: LIB.REACT_LIB,
    content: <ImageCropDialogDemo />,
  },
  {
    id: 'multi-select',
    label: 'Multi Select',
    description: 'Dropdown of checkable options.',
    lib: LIB.REACT_LIB,
    content: <MultiSelectDemo />,
  },
  {
    id: 'progress',
    label: 'Progress',
    description: 'Horizontal progress bar.',
    lib: LIB.REACT_LIB,
    content: <ProgressDemo />,
  },
  {
    id: 'scroll-area',
    label: 'Scroll Area',
    description: 'Scroll container with a styled scrollbar.',
    lib: LIB.REACT_LIB,
    content: <ScrollAreaDemo />,
  },
  {
    id: 'skeleton',
    label: 'Skeleton',
    description: 'Loading placeholders, including the card skeleton.',
    lib: LIB.REACT_LIB,
    content: <SkeletonDemo />,
  },
  {
    id: 'stacked-images',
    label: 'Stacked Images',
    description: 'Overlapping row of thumbnails.',
    lib: LIB.REACT_LIB,
    content: <StackedImagesDemo />,
  },
  {
    id: 'team-avatar',
    label: 'Team Avatar',
    description: 'Avatar for a team, with a colored initial fallback.',
    lib: LIB.REACT_LIB,
    content: <TeamAvatarDemo />,
  },
];

const ENTRY_STAGE_CLASS = 'flex flex-col gap-3 mt-2';
const ENTRY_SECTION_LABEL = {
  BUILT_WITH: 'Built with',
  DEMO: 'Demo',
} as const;
const OVERVIEW_GRID_CLASS =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3';
const SECTION_ID_PREFIX = 'vigilant-broccoli-';
// The mobile topbar is fixed over the scroll container, so leave room for it.
const OVERVIEW_SECTION_CLASS =
  'flex flex-col gap-4 scroll-mt-16 md:scroll-mt-6';
const OVERVIEW_SECTION_LINK_CLASS = 'underline-offset-4 hover:underline';
const OVERVIEW_LINK_CLASS =
  'text-base font-medium text-gray-900 underline-offset-4 hover:underline dark:text-gray-100';

const SIDEBAR_POSITION_CLASS = 'fixed top-0 left-0 bottom-0 z-30 peer';
const CONTENT_WRAPPER_BASE_CLASS =
  'h-full overflow-y-auto pt-12 md:pt-0 pl-0 transition-[padding] duration-200';
// Every item carries an icon, so the desktop sidebar collapses to an icon
// rail and only expands to full width on hover (see canCollapse in
// Sidebar.tsx) - the content needs the matching peer-hover pair to shift with
// it instead of staying padded for the expanded width.
const CONTENT_WRAPPER_RAIL_CLASS = 'md:pl-14 md:peer-hover:pl-60';
// Overrides Sidebar's default md:hover:w-48 expanded width (merged via cn's
// tailwind-merge) so the longest lib and entry names fit without clipping.
const SIDEBAR_EXPANDED_WIDTH_CLASS = 'md:hover:w-60';
const TOPBAR_CLASS =
  'md:hidden fixed top-0 left-0 right-0 z-10 flex h-12 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950';
const MENU_BUTTON_CLASS =
  'cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-50 hover:text-black dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white';
const OPEN_MENU_LABEL = 'Open menu';

export interface ComponentSandboxProps {
  siteName?: string;
  title?: string;
  subtitle?: string;
  wrapInTheme?: boolean;
  themeStorageKey?: string;
}

type BuildSidebarItemsArgs = {
  entries: SandboxEntry[];
  selectedId: string;
  onSelect: (id: string) => void;
};

const buildSidebarItems = ({
  entries,
  selectedId,
  onSelect,
}: BuildSidebarItemsArgs): SidebarCTA[] => {
  const typography = entries.find(entry => entry.id === TYPOGRAPHY_ID);
  const libGroups = Object.values(LIB)
    .map(lib => ({
      lib,
      items: entries.filter(
        entry => entry.lib === lib && entry.id !== TYPOGRAPHY_ID,
      ),
    }))
    .filter(group => group.items.length > 0)
    .map(group => ({
      id: group.lib,
      label: group.lib,
      icon: LIB_ICON[group.lib],
      isActive: group.items.some(entry => entry.id === selectedId),
      children: group.items.map(entry => ({
        label: entry.label,
        isActive: entry.id === selectedId,
        onClick: () => onSelect(entry.id),
      })),
    }));
  return [
    ...(typography
      ? [
          {
            id: TYPOGRAPHY_ID,
            label: typography.label,
            icon: TypeIcon,
            isActive: selectedId === TYPOGRAPHY_ID,
            onClick: () => onSelect(TYPOGRAPHY_ID),
          },
        ]
      : []),
    {
      id: OVERVIEW_ID,
      label: OVERVIEW_LABEL,
      icon: LayoutGrid,
      isActive: selectedId === OVERVIEW_ID,
      onClick: () => onSelect(OVERVIEW_ID),
    },
    {
      id: PACKAGE_SCOPE_GROUP_ID,
      label: PACKAGE_SCOPE_GROUP_ID,
      icon: Package,
      isActive: libGroups.some(group => group.isActive),
      children: libGroups,
    },
  ];
};

// Kept separate from buildSidebarItems - app chrome, not browsable demo
// content.
const buildSettingsItem = ({
  selectedId,
  onSelect,
}: Omit<BuildSidebarItemsArgs, 'entries'>): SidebarCTA => ({
  id: SETTINGS_ID,
  label: SETTINGS_LABEL,
  icon: SettingsIcon,
  isActive: selectedId === SETTINGS_ID,
  onClick: () => onSelect(SETTINGS_ID),
});

const SandboxSettings = () => (
  <div className="flex max-w-md flex-col gap-6">
    <Heading size="7">{SETTINGS_LABEL}</Heading>
    <ThemePreferenceControl fullWidth />
  </div>
);

const SandboxEntryFrame = ({
  entry,
  onSelect,
}: {
  entry: SandboxEntry;
  onSelect: (id: string) => void;
}) => (
  <section className="flex flex-col gap-3">
    <header className="flex flex-col gap-1">
      <Heading size="5" className="block">
        {entry.label}
      </Heading>
      <Text size="2" color="gray">
        {entry.description}
      </Text>
    </header>
    {BUILT_WITH[entry.id] && <hr className="border-border" />}
    {BUILT_WITH[entry.id] && (
      <section className="flex flex-col gap-2">
        <Heading as="h2" size="3">
          {ENTRY_SECTION_LABEL.BUILT_WITH}
        </Heading>
        <ButtonList
          buttons={BUILT_WITH[entry.id].map(({ name, entryId }) => ({
            label: name,
            disabled: !entryId,
            onClick: () => entryId && onSelect(entryId),
          }))}
        />
      </section>
    )}
    {BUILT_WITH[entry.id] && <hr className="border-border" />}
    <section className="flex flex-col gap-2">
      <Heading as="h2" size="3">
        {ENTRY_SECTION_LABEL.DEMO}
      </Heading>
      <div className={ENTRY_STAGE_CLASS}>{entry.content}</div>
    </section>
  </section>
);

interface SandboxOverviewProps {
  entries: SandboxEntry[];
  onSelect: (id: string) => void;
}

// Prefixed because a bare lib name can equal an entry id (`docs-explorer`),
// which redirectLegacyHash would treat as an entry link.
const sectionIdFor = (lib: Lib) => `${SECTION_ID_PREFIX}${lib}`;

const SandboxOverview = ({ entries, onSelect }: SandboxOverviewProps) => {
  // The sections render after the browser's own fragment scroll on load.
  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    if (hashId) document.getElementById(hashId)?.scrollIntoView();
  }, []);

  return (
    <div className="flex flex-col gap-10">
      <Heading size="7">{OVERVIEW_LABEL}</Heading>
      {Object.values(LIB).map(lib => (
        <SandboxOverviewSection
          key={lib}
          lib={lib}
          entries={entries.filter(entry => entry.id !== TYPOGRAPHY_ID)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

interface SandboxOverviewSectionProps extends SandboxOverviewProps {
  lib: Lib;
}

const SandboxOverviewSection = ({
  lib,
  entries,
  onSelect,
}: SandboxOverviewSectionProps) => {
  const libEntries = entries
    .filter(entry => entry.lib === lib)
    .sort((a, b) => a.label.localeCompare(b.label));
  if (libEntries.length === 0) return null;
  const sectionId = sectionIdFor(lib);
  return (
    <section id={sectionId} className={OVERVIEW_SECTION_CLASS}>
      <Heading size="4" className="border-b border-border pb-2">
        <a href={`#${sectionId}`} className={OVERVIEW_SECTION_LINK_CLASS}>
          {`${PACKAGE_SCOPE}${lib}`}
        </a>
      </Heading>
      <ul className={OVERVIEW_GRID_CLASS}>
        {libEntries.map(entry => (
          <li key={entry.id}>
            <a
              href={pathFor(entry.id)}
              onClick={event => {
                if (!isPlainLeftClick(event)) return;
                event.preventDefault();
                onSelect(entry.id);
              }}
              className={OVERVIEW_LINK_CLASS}
            >
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

interface SandboxTopbarProps {
  title: string;
  onMenuClick: () => void;
}

const SandboxTopbar = ({ title, onMenuClick }: SandboxTopbarProps) => (
  <header className={TOPBAR_CLASS}>
    <button
      type="button"
      aria-label={OPEN_MENU_LABEL}
      onClick={onMenuClick}
      className={MENU_BUTTON_CLASS}
    >
      <Menu size={20} />
    </button>
    <Text weight="medium" size="3">
      {title}
    </Text>
  </header>
);

interface SandboxBodyProps {
  siteName?: string;
  title?: string;
  subtitle?: string;
  showSettings: boolean;
}

// Each entry lives at `/<entry id>` (e.g. `/crud-list`) so READMEs can link
// straight to a component; `/` is the overview. Unknown paths fall back to the
// overview because Cloudflare Pages serves index.html for them (no 404.html).
const isSelectableId = (id: string | null): id is string =>
  id === OVERVIEW_ID ||
  id === SETTINGS_ID ||
  ALL_ENTRIES.some(entry => entry.id === id);

const pathFor = (id: string) => (id === OVERVIEW_ID ? '/' : `/${id}`);

const readPathSelectedId = () => {
  const pathId = window.location.pathname.replace(/^\/|\/$/g, '');
  return isSelectableId(pathId) ? pathId : OVERVIEW_ID;
};

// Links published before path navigation (READMEs on npm) use `/#<entry id>`.
const redirectLegacyHash = () => {
  const hashId = window.location.hash.slice(1);
  if (isSelectableId(hashId)) {
    window.history.replaceState(null, '', pathFor(hashId));
  }
};

const readInitialSelectedId = () => {
  redirectLegacyHash();
  return readPathSelectedId();
};

const isPlainLeftClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey;

const resolveSelection = (
  entries: SandboxEntry[],
  selectedId: string,
  showSettings: boolean,
) => {
  if (selectedId === SETTINGS_ID && showSettings) {
    return {
      selectedEntry: undefined,
      selectedLabel: SETTINGS_LABEL,
      openGroupId: null,
      isSettings: true,
    };
  }
  if (selectedId === OVERVIEW_ID || selectedId === SETTINGS_ID) {
    return {
      selectedEntry: undefined,
      selectedLabel: OVERVIEW_LABEL,
      openGroupId: null,
      isSettings: false,
    };
  }
  const entry = entries.find(e => e.id === selectedId) ?? entries[0];
  return {
    selectedEntry: entry,
    selectedLabel: entry.label,
    openGroupId: PACKAGE_SCOPE_GROUP_ID,
    isSettings: false,
  };
};

const SandboxDocumentTitle = ({ title }: { title: string }) => {
  useDocumentTitle(title);
  return null;
};

const SandboxBody = ({
  siteName,
  title,
  subtitle,
  showSettings,
}: SandboxBodyProps) => {
  const { t: translateSandbox } = useSandboxTranslation();
  const entries = useMemo(
    () =>
      ALL_ENTRIES.map(entry =>
        entry.foundationKey
          ? {
              ...entry,
              label: translateSandbox(
                `FOUNDATIONS.${entry.foundationKey}.NAME`,
              ),
              description: translateSandbox(
                `FOUNDATIONS.${entry.foundationKey}.SUMMARY`,
              ),
            }
          : entry.id === 'alert-dialog'
            ? {
                ...entry,
                label: translateSandbox('ALERT_DIALOG.NAME'),
                description: translateSandbox('ALERT_DIALOG.SUMMARY'),
              }
            : entry,
      ),
    [translateSandbox],
  );
  const [selectedId, setSelectedId] = useState(readInitialSelectedId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onPopState = () => setSelectedId(readPathSelectedId());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const { selectedEntry, selectedLabel, openGroupId, isSettings } =
    resolveSelection(entries, selectedId, showSettings);

  const selectId = (id: string) => {
    setSelectedId(id);
    if (window.location.pathname !== pathFor(id)) {
      window.history.pushState(null, '', pathFor(id));
    }
    setSidebarOpen(false);
  };

  const items = useMemo(
    () => [
      ...buildSidebarItems({
        entries,
        selectedId,
        onSelect: selectId,
      }),
      ...(showSettings
        ? [buildSettingsItem({ selectedId, onSelect: selectId })]
        : []),
    ],
    [entries, selectedId, showSettings],
  );

  return (
    <div className="h-full">
      {siteName && (
        <SandboxDocumentTitle title={`${selectedLabel} | ${siteName}`} />
      )}
      <Sidebar
        items={items}
        searchable
        className={`${SIDEBAR_POSITION_CLASS} ${SIDEBAR_EXPANDED_WIDTH_CLASS}`}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
        defaultOpenId={openGroupId}
        expandOn="click"
      />
      <SandboxTopbar
        title={title ?? selectedLabel}
        onMenuClick={() => setSidebarOpen(open => !open)}
      />
      <div
        className={`${CONTENT_WRAPPER_BASE_CLASS} ${CONTENT_WRAPPER_RAIL_CLASS}`}
      >
        <div className="p-6 max-w-4xl">
          {title && (
            <Heading size="8" mb="2">
              {title}
            </Heading>
          )}
          {subtitle && (
            <Text color="gray" size="4" mb="6">
              {subtitle}
            </Text>
          )}
          {isSettings ? (
            <SandboxSettings />
          ) : selectedEntry ? (
            <SandboxEntryFrame entry={selectedEntry} onSelect={selectId} />
          ) : (
            <SandboxOverview entries={entries} onSelect={selectId} />
          )}
        </div>
      </div>
    </div>
  );
};

function ComponentSandboxContent({
  wrapInTheme = false,
  themeStorageKey,
  ...props
}: ComponentSandboxProps): ReactNode {
  return wrapInTheme ? (
    <ThemeProvider storageKey={themeStorageKey}>
      <div className="w-full h-screen overflow-hidden">
        <SandboxBody {...props} showSettings />
      </div>
    </ThemeProvider>
  ) : (
    <SandboxBody {...props} showSettings={false} />
  );
}

export function ComponentSandbox(props: ComponentSandboxProps): ReactNode {
  return (
    <SandboxI18nProvider>
      <ComponentSandboxContent {...props} />
    </SandboxI18nProvider>
  );
}
