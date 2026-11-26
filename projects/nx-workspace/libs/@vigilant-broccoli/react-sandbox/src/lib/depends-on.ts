// Shared components each entry's implementation depends on, keyed by entry
// id. A button opens the entry that demos the component; one without an
// entryId has no page and is disabled. Lists come from the component's own
// source, never from what its demo renders around it, so base components and
// demo-only pages (Error Handling, Mobile Home) have no row.
export type DependsOnItem = { name: string; entryId?: string };

export const DEPENDS_ON: Record<string, DependsOnItem[]> = {
  alarm: [
    { name: 'Badge', entryId: 'badge' },
    { name: 'Button', entryId: 'buttons' },
    { name: 'Input', entryId: 'input' },
    { name: 'Progress', entryId: 'progress' },
    { name: 'ScrollArea', entryId: 'scroll-area' },
    { name: 'Text', entryId: 'typography' },
  ],
  avatar: [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'ImageCropDialog', entryId: 'image-crop-dialog' },
    { name: 'Input', entryId: 'input' },
  ],
  'button-list': [{ name: 'Button', entryId: 'buttons' }],
  buttons: [{ name: 'IconButton', entryId: 'icon-button' }],
  calculator: [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Input', entryId: 'input' },
    { name: 'ScrollArea', entryId: 'scroll-area' },
    { name: 'Text', entryId: 'typography' },
  ],
  'calendar-event-details': [{ name: 'Dialog', entryId: 'dialog' }],
  'calendar-list': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Text', entryId: 'typography' },
  ],
  card: [
    { name: 'Skeleton', entryId: 'skeleton' },
    { name: 'Text', entryId: 'typography' },
  ],
  'chat-history-sidebar': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'ConfirmDeleteDialog', entryId: 'confirm-delete-dialog' },
    { name: 'DropdownMenu', entryId: 'dropdown-menu' },
    { name: 'IconButton', entryId: 'icon-button' },
    { name: 'Input', entryId: 'input' },
    { name: 'ScrollArea', entryId: 'scroll-area' },
    { name: 'Text', entryId: 'typography' },
  ],
  'chat-input-area': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'ChatSendButton', entryId: 'buttons' },
    { name: 'IconButton', entryId: 'icon-button' },
    {
      name: 'SpeechToTextToggleButton',
      entryId: 'speech-to-text-toggle-button',
    },
    { name: 'Text', entryId: 'typography' },
    { name: 'Textarea', entryId: 'textarea' },
  ],
  'chat-messages-area': [
    { name: 'ScrollArea', entryId: 'scroll-area' },
    { name: 'Text', entryId: 'typography' },
  ],
  'chat-panel': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Text', entryId: 'typography' },
  ],
  checklist: [
    { name: 'Checkbox', entryId: 'checkbox' },
    { name: 'CollapsibleList', entryId: 'collapsible-list-item' },
    { name: 'EllipsisCTA', entryId: 'ellipsis-cta' },
    { name: 'Input', entryId: 'input' },
    { name: 'Skeleton', entryId: 'skeleton' },
    { name: 'Text', entryId: 'typography' },
    { name: 'Textarea', entryId: 'textarea' },
  ],
  'confirm-delete-dialog': [
    { name: 'AlertDialog', entryId: 'alert-dialog' },
    { name: 'Button', entryId: 'buttons' },
  ],
  'clearable-input': [{ name: 'Input', entryId: 'input' }],
  'cooking-conversions': [
    { name: 'Input', entryId: 'input' },
    { name: 'Text', entryId: 'typography' },
  ],
  'copy-pastable': [
    { name: 'Card', entryId: 'card' },
    { name: 'CopyButton', entryId: 'buttons' },
    { name: 'ScrollArea', entryId: 'scroll-area' },
  ],
  'create-calendar-event-dialog': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'CalendarInput', entryId: 'create-calendar-event-dialog' },
    { name: 'Dialog', entryId: 'dialog' },
  ],
  'crud-list': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Card', entryId: 'card' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'EllipsisCTA', entryId: 'ellipsis-cta' },
    { name: 'Heading', entryId: 'typography' },
    { name: 'IconButton', entryId: 'icon-button' },
    { name: 'StackedImages', entryId: 'stacked-images' },
  ],
  'currency-converter': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Input', entryId: 'input' },
    { name: 'ScrollArea', entryId: 'scroll-area' },
    { name: 'Select', entryId: 'select' },
    { name: 'Text', entryId: 'typography' },
  ],
  'delete-item-confirmation-dialog': [
    { name: 'AlertDialog', entryId: 'alert-dialog' },
    { name: 'Button', entryId: 'buttons' },
  ],
  'docs-explorer': [
    { name: 'Card', entryId: 'card' },
    { name: 'ClearableInput', entryId: 'clearable-input' },
    {
      name: 'DeleteItemConfirmationDialog',
      entryId: 'delete-item-confirmation-dialog',
    },
    { name: 'DropdownMenu', entryId: 'dropdown-menu' },
    { name: 'HighlightMatch', entryId: 'highlight-match' },
    { name: 'IconButton', entryId: 'icon-button' },
  ],
  'docs-viewer': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'ChecklistViewer', entryId: 'docs-viewer' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'DocsExplorer', entryId: 'docs-explorer' },
    { name: 'GraphView', entryId: 'graph-view' },
    { name: 'IconButton', entryId: 'icon-button' },
    { name: 'MarkdownViewer', entryId: 'markdown-viewer' },
    { name: 'Popover', entryId: 'popover' },
    { name: 'SegmentedControl', entryId: 'segmented-control' },
    { name: 'Select', entryId: 'select' },
    { name: 'Switch', entryId: 'switch' },
  ],
  'download-button': [
    { name: 'DropdownMenu', entryId: 'dropdown-menu' },
    { name: 'IconButton', entryId: 'icon-button' },
  ],
  'ellipsis-cta': [
    {
      name: 'DeleteItemConfirmationDialog',
      entryId: 'delete-item-confirmation-dialog',
    },
    { name: 'DropdownMenu', entryId: 'dropdown-menu' },
    { name: 'IconButton', entryId: 'icon-button' },
  ],
  'embed-dialog': [
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'IconButton', entryId: 'icon-button' },
  ],
  'empty-leaderboard': [
    { name: 'BaseLeaderboard', entryId: 'user-leaderboard' },
    { name: 'Button', entryId: 'buttons' },
    { name: 'FloatingFollow', entryId: 'user-leaderboard' },
    { name: 'LeaderboardFilterField', entryId: 'user-leaderboard' },
    { name: 'LeaderboardSkeleton', entryId: 'user-leaderboard' },
    { name: 'MultiSelect', entryId: 'multi-select' },
    { name: 'Select', entryId: 'select' },
    { name: 'UserRow', entryId: 'user-leaderboard' },
  ],
  'entry-directory': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'ButtonList', entryId: 'button-list' },
    { name: 'ClearableInput', entryId: 'clearable-input' },
    { name: 'CopyButton', entryId: 'buttons' },
    { name: 'EllipsisCTA', entryId: 'ellipsis-cta' },
    { name: 'IconButton', entryId: 'icon-button' },
    { name: 'Tabs', entryId: 'tabs' },
    { name: 'Text', entryId: 'typography' },
  ],
  'file-explorer': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'ConfirmDeleteDialog', entryId: 'confirm-delete-dialog' },
    { name: 'ContextMenu', entryId: 'context-menu' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'DropdownMenu', entryId: 'dropdown-menu' },
  ],
  'github-actions-badges': [{ name: 'Text', entryId: 'typography' }],
  'google-sign-in-page': [{ name: 'GoogleSigninButton', entryId: 'buttons' }],
  'group-leaderboard': [
    { name: 'BaseLeaderboard', entryId: 'user-leaderboard' },
    { name: 'LeaderboardFilterField', entryId: 'user-leaderboard' },
    { name: 'LeaderboardMetricCell', entryId: 'group-leaderboard' },
    { name: 'LeaderboardRow', entryId: 'group-leaderboard' },
    { name: 'LeaderboardSkeleton', entryId: 'user-leaderboard' },
    { name: 'Select', entryId: 'select' },
    { name: 'TeamAvatar', entryId: 'team-avatar' },
  ],
  'icon-button': [{ name: 'Button', entryId: 'buttons' }],
  'image-carousel': [{ name: 'Dialog', entryId: 'dialog' }],
  'image-gallery': [
    { name: 'JustifiedLayout', entryId: 'image-gallery' },
    { name: 'MasonryLayout', entryId: 'image-gallery' },
    { name: 'StackLayout', entryId: 'image-gallery' },
  ],
  'image-crop-dialog': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'Input', entryId: 'input' },
  ],
  'markdown-viewer': [
    { name: 'CollapsibleList', entryId: 'collapsible-list-item' },
  ],
  'multi-select': [
    { name: 'Checkbox', entryId: 'checkbox' },
    { name: 'Popover', entryId: 'popover' },
  ],
  pomodoro: [
    { name: 'Badge', entryId: 'badge' },
    { name: 'Button', entryId: 'buttons' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'Input', entryId: 'input' },
  ],
  'preview-deployments': [
    { name: 'Callout', entryId: 'callout' },
    { name: 'Card', entryId: 'card' },
    { name: 'Text', entryId: 'typography' },
  ],
  'qr-reader': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Text', entryId: 'typography' },
  ],
  'quick-links': [
    { name: 'CloseButton', entryId: 'buttons' },
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'EmbedDialog', entryId: 'embed-dialog' },
    { name: 'EntryDirectory', entryId: 'entry-directory' },
  ],
  'scroll-timeline': [{ name: 'Text', entryId: 'typography' }],
  'search-input': [{ name: 'Input', entryId: 'input' }],
  'security-news-list': [
    { name: 'Badge', entryId: 'badge' },
    { name: 'Text', entryId: 'typography' },
  ],
  'segmented-control': [{ name: 'ToggleGroup', entryId: 'toggle-group' }],
  'sign-out-button': [{ name: 'Button', entryId: 'buttons' }],
  skeleton: [
    { name: 'Card', entryId: 'card' },
    { name: 'Text', entryId: 'typography' },
  ],
  'status-card-list': [
    { name: 'CollapsibleList', entryId: 'collapsible-list-item' },
    { name: 'Text', entryId: 'typography' },
  ],
  stopwatch: [
    { name: 'Button', entryId: 'buttons' },
    { name: 'ScrollArea', entryId: 'scroll-area' },
    { name: 'Text', entryId: 'typography' },
  ],
  tabs: [{ name: 'ToggleIndicator', entryId: 'toggle-group' }],
  'task-schedule-fields': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Calendar', entryId: 'calendar' },
    { name: 'SegmentedControl', entryId: 'segmented-control' },
    { name: 'ToggleChipGroup', entryId: 'toggle-chip-group' },
  ],
  tasks: [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Card', entryId: 'card' },
    { name: 'CardSkeleton', entryId: 'card' },
    { name: 'CheckList', entryId: 'checklist' },
    { name: 'GoogleSigninButton', entryId: 'buttons' },
    { name: 'Select', entryId: 'select' },
    { name: 'Skeleton', entryId: 'skeleton' },
    {
      name: 'SpeechToTextToggleButton',
      entryId: 'speech-to-text-toggle-button',
    },
    { name: 'Text', entryId: 'typography' },
    { name: 'Textarea', entryId: 'textarea' },
  ],
  'team-avatar': [{ name: 'Avatar', entryId: 'avatar' }],
  'theme-preference-control': [
    { name: 'SegmentedControl', entryId: 'segmented-control' },
  ],
  timer: [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Text', entryId: 'typography' },
  ],
  'toggle-chip-group': [{ name: 'Button', entryId: 'buttons' }],
  'upptime-status-list': [
    { name: 'Dialog', entryId: 'dialog' },
    { name: 'Skeleton', entryId: 'skeleton' },
  ],
  'user-avatar': [{ name: 'Avatar', entryId: 'avatar' }],
  'user-leaderboard': [
    { name: 'BaseLeaderboard', entryId: 'user-leaderboard' },
    { name: 'Button', entryId: 'buttons' },
    { name: 'FloatingFollow', entryId: 'user-leaderboard' },
    { name: 'LeaderboardFilterField', entryId: 'user-leaderboard' },
    { name: 'LeaderboardSkeleton', entryId: 'user-leaderboard' },
    { name: 'MultiSelect', entryId: 'multi-select' },
    { name: 'Select', entryId: 'select' },
    { name: 'UserRow', entryId: 'user-leaderboard' },
  ],
  'weather-clock-card': [
    { name: 'ClockComponent', entryId: 'weather-clock-card' },
    { name: 'ForecastCarousel', entryId: 'weather-clock-card' },
    { name: 'LocalWeatherMessage', entryId: 'weather-clock-card' },
  ],
  'weather-embed-card': [
    { name: 'Button', entryId: 'buttons' },
    { name: 'Skeleton', entryId: 'skeleton' },
    { name: 'Text', entryId: 'typography' },
  ],
};

// Inverse of DEPENDS_ON: entry id -> ids of the entries that depend on it.
// An entry listing its own sub-components (entryId pointing back at itself) is
// not a dependent of itself.
export const USED_BY: Record<string, string[]> = Object.entries(
  DEPENDS_ON,
).reduce<Record<string, string[]>>((usedBy, [id, items]) => {
  items.forEach(({ entryId }) => {
    if (!entryId || entryId === id) return;
    const dependents = usedBy[entryId] ?? [];
    if (!dependents.includes(id)) usedBy[entryId] = [...dependents, id];
  });
  return usedBy;
}, {});
