'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Database } from 'lucide-react';
import { cn } from '../utils/cn';

type HeadingLevel = 'h1' | 'h2' | 'h3';

const HEADING_SIZE: Record<HeadingLevel, string> = {
  h1: 'text-2xl',
  h2: 'text-xl',
  h3: 'text-lg',
};

function LeaderboardHeading({
  level = 'h1',
  centered = false,
  className = '',
  children,
}: {
  level?: HeadingLevel;
  centered?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Tag = level;
  return (
    <Tag
      className={cn(
        'font-bold text-foreground',
        HEADING_SIZE[level],
        centered && 'text-center',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export interface BaseLeaderboardProps {
  /** Title displayed in the header */
  title: string;
  /** Filter controls to display in the toolbar */
  filterControls: ReactNode;
  /** Content/rows to display in the leaderboard */
  children: ReactNode;
  /** Whether the leaderboard is in a loading state */
  loading?: boolean;
  /** Whether the leaderboard is refreshing (for fade effects) */
  refreshing?: boolean;
  /** Enable fade effect during refresh */
  enableRefreshFade?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Whether to show the heading in default view */
  showHeading?: boolean;
  /** Heading level */
  headingLevel?: HeadingLevel;
  /** Callback when fullscreen state changes */
  onFullscreenChange?: (isFullscreen: boolean) => void;
  /** Whether there is no data to display */
  isEmpty?: boolean;
  /** Empty state message to display when no data is available */
  emptyStateMessage?: string;
  /** Enable fullscreen keyboard shortcut (F key) */
  enableFullscreenKeybind?: boolean;
}

/**
 * BaseLeaderboard - A reusable leaderboard container component
 *
 * Features:
 * - Fullscreen mode with maximize/minimize controls
 * - Mouse inactivity detection (controls fade after 3s of inactivity)
 * - Keyboard shortcuts (F to toggle fullscreen, Escape to exit)
 * - Responsive toolbar layout
 */
// eslint-disable-next-line complexity
export function BaseLeaderboard({
  title,
  filterControls,
  children,
  loading = false,
  refreshing = false,
  enableRefreshFade = false,
  className = '',
  showHeading = true,
  headingLevel = 'h1',
  onFullscreenChange,
  isEmpty = false,
  emptyStateMessage = 'No data available',
  enableFullscreenKeybind = false,
}: BaseLeaderboardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Database className="w-12 h-12 mb-3 opacity-50" />
      <p className="text-sm">{emptyStateMessage}</p>
    </div>
  );

  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    const handleExitFullscreen = () => {
      if (isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener(
      'leaderboard-exit-fullscreen',
      handleExitFullscreen,
    );
    return () =>
      window.removeEventListener(
        'leaderboard-exit-fullscreen',
        handleExitFullscreen,
      );
  }, [isFullscreen]);

  useEffect(() => {
    // eslint-disable-next-line complexity
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      if (isInputElement) return;

      const chatbotPanel = document.querySelector('[data-chatbot-panel]');
      const isChatbotOpen = chatbotPanel !== null;

      if (event.key === 'Escape' && isFullscreen && !isChatbotOpen) {
        event.preventDefault();
        setIsFullscreen(false);
      }

      const isPlainFKey =
        (event.key === 'f' || event.key === 'F') &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey;

      if (isPlainFKey && !isChatbotOpen && enableFullscreenKeybind) {
        event.preventDefault();
        if (!isFullscreen)
          window.dispatchEvent(new Event('leaderboard-exit-fullscreen'));
        setIsFullscreen(!isFullscreen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, enableFullscreenKeybind]);

  useEffect(() => {
    if (!isFullscreen) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetInactivityTimer = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      resetInactivityTimer();
    };

    const handleMouseEnter = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseenter', handleMouseEnter);

    resetInactivityTimer();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseenter', handleMouseEnter);
      clearTimeout(timeoutId);
    };
  }, [isFullscreen]);

  if (isFullscreen) {
    if (typeof document === 'undefined') {
      return null;
    }

    const overlayRoot =
      document.getElementById('dashboard-overlay-root') ?? document.body;

    return createPortal(
      <div
        className="fixed inset-0 bg-background flex flex-col overflow-hidden animate-in fade-in duration-300"
        style={{ zIndex: 50000 }}
      >
        <div className="flex-shrink-0 p-6 border-b border-border">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="lg:min-w-[18rem] lg:pr-4 lg:self-center">
              <LeaderboardHeading className="text-left">
                {title}
              </LeaderboardHeading>
            </div>

            <div
              className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0 lg:items-center transition-opacity duration-500"
              onMouseEnter={() => setShowControls(true)}
              style={{
                opacity: showControls ? 1 : 0,
                pointerEvents: showControls ? 'auto' : 'none',
              }}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0 overflow-x-auto pb-1 sm:flex-nowrap">
                {filterControls}
              </div>
              <div className="sm:ml-auto self-center">
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition hover:scale-110 hover:bg-accent active:scale-95"
                  aria-label="Exit fullscreen"
                  title="Exit fullscreen (Esc)"
                >
                  <Minimize2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            className="transition-opacity duration-300"
            style={{ opacity: enableRefreshFade && refreshing ? 0 : 1 }}
          >
            {isEmpty && !loading ? <EmptyState /> : children}
          </div>
        </div>
      </div>,
      overlayRoot,
    );
  }

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {showHeading && (
        <LeaderboardHeading level={headingLevel} centered>
          {title}
        </LeaderboardHeading>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0 lg:items-center">
          <div className="flex items-start gap-4 flex-1 min-w-0 overflow-x-auto pb-1 sm:flex-nowrap">
            {filterControls}
          </div>
          <div className="sm:ml-auto self-center">
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 hover:bg-accent rounded-lg transition hover:scale-110 active:scale-95"
              aria-label="Fullscreen"
              title="Fullscreen (F)"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="transition-opacity duration-300"
        style={{ opacity: enableRefreshFade && refreshing ? 0 : 1 }}
      >
        {isEmpty && !loading ? <EmptyState /> : children}
      </div>
    </div>
  );
}
