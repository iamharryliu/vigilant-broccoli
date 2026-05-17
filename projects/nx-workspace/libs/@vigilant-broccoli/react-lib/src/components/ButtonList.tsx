import { useRef, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button, buttonVariants } from './Button';
import { VariantProps } from 'class-variance-authority';
import {
  moveQuickLinkFocusByDirection,
  QUICK_LINK_ITEM_ATTR,
  ARROW_KEYS,
  Direction,
} from '../utils/focus-navigation.utils';

const BASE_BUTTON_CLASS =
  'transition-transform duration-150 focus:scale-110 focus:outline-none';

export type ButtonConfig = {
  label: string;
  onClick: () => void;
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  disabled?: boolean;
  loading?: boolean;
  isExternal?: boolean;
  buttonProps?: Record<string, unknown>;
};

type ButtonListProps = {
  buttons: ButtonConfig[];
  className?: string;
};

export const ButtonList = ({ buttons, className }: ButtonListProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.click();
      return;
    }
    if (!(ARROW_KEYS as readonly string[]).includes(e.key)) return;
    e.preventDefault();
    const direction: Direction =
      e.key === 'ArrowDown'
        ? 'down'
        : e.key === 'ArrowUp'
          ? 'up'
          : e.key === 'ArrowRight'
            ? 'right'
            : 'left';
    moveQuickLinkFocusByDirection({
      contentRoot: contentRef.current,
      searchInput: null,
      currentElement: e.currentTarget,
      direction,
    });
  }, []);

  return (
    <div ref={contentRef} className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {buttons.map(
        (
          {
            label,
            onClick,
            variant = 'secondary',
            size = 'xs',
            disabled,
            loading,
            isExternal,
            buttonProps,
          },
          index,
        ) => {
          const { className: btnClassName, ...restButtonProps } =
            (buttonProps ?? {}) as Record<string, unknown> & {
              className?: string;
            };
          const mergedClassName = `${BASE_BUTTON_CLASS}${btnClassName ? ` ${btnClassName}` : ''}`;
          return (
            <Button
              key={`${label}-${index}`}
              onClick={onClick}
              variant={variant}
              size={size}
              disabled={disabled}
              loading={loading}
              className={mergedClassName}
              onMouseEnter={e => e.currentTarget.focus()}
              onKeyDown={handleKeyDown}
              {...{ [QUICK_LINK_ITEM_ATTR]: 'true' }}
              {...restButtonProps}
            >
              {label}
              {isExternal && <ExternalLink size={10} className="shrink-0" />}
            </Button>
          );
        },
      )}
    </div>
  );
};
