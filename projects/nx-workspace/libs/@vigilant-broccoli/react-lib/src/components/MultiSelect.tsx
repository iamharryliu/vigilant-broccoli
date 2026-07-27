/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { CheckedState } from '@radix-ui/react-checkbox';
import { ChevronDown } from 'lucide-react';
import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../utils/cn';
import { Checkbox } from './Checkbox';

const MULTISELECT_TEXT = {
  SELECT: 'Select',
  NO_OPTIONS: 'No options',
} as const;

interface MultiSelectProps<T extends Record<string, any>> {
  values?: string[];
  options: T[];
  onValueChange(value: string[]): void;
  displayKey: string;
  renderOption?: (option: T) => ReactNode;
  placeholder?: string;
  showSelection?: boolean;
  triggerClassName?: string;
}

export function MultiSelect<T extends Record<string, any>>({
  values: value,
  options,
  onValueChange,
  displayKey,
  renderOption,
  placeholder,
  showSelection = false,
  triggerClassName,
}: MultiSelectProps<T>) {
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<CSSProperties>({});

  useEffect(() => {
    setSelectedOptionIds(value?.map(String) ?? []);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownMaxHeight = 252;
      const spaceBelow = window.innerHeight - rect.bottom - 4;
      const spaceAbove = rect.top - 4;
      const openUpward =
        spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: 'max-content',
        minWidth: rect.width,
        maxWidth: window.innerWidth - rect.left - 16,
        zIndex: 100000,
        ...(openUpward
          ? { bottom: window.innerHeight - rect.top + 4, maxHeight: spaceAbove }
          : { top: rect.bottom + 4, maxHeight: spaceBelow }),
      });
    }
  }, [isOpen]);

  const handleTypeToggle = (typeId: string, checked: CheckedState) => {
    let newSelection: string[];

    if (checked) {
      newSelection = [...selectedOptionIds, typeId];
    } else {
      newSelection = selectedOptionIds.filter(id => id !== typeId);
    }
    setSelectedOptionIds(newSelection);
    onValueChange(newSelection);
  };

  const displayText = useMemo(() => {
    const defaultText = placeholder ?? MULTISELECT_TEXT.SELECT;
    if (!showSelection || selectedOptionIds.length === 0) return defaultText;
    const selectedTypes = options.filter(option =>
      selectedOptionIds.includes(option.id.toString()),
    );
    return selectedTypes.map(option => option[displayKey]).join(', ');
  }, [selectedOptionIds, options, displayKey, placeholder, showSelection]);

  return (
    <div ref={triggerRef}>
      <button
        type="button"
        className={cn(
          'flex h-8 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          triggerClassName,
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`text-sm overflow-hidden overflow-ellipsis whitespace-nowrap ${
            showSelection && selectedOptionIds.length > 0
              ? 'text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          {displayText}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[55]"
              style={{ pointerEvents: 'auto' }}
              onClick={() => setIsOpen(false)}
            />
            <div
              style={{ ...dropdownStyle, pointerEvents: 'auto' }}
              className="bg-popover border rounded-md shadow-lg border-input overflow-auto"
            >
              <div className="p-1">
                {options.map(option => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm"
                  >
                    <Checkbox
                      id={`option-${option.id}`}
                      checked={selectedOptionIds.includes(option.id.toString())}
                      onCheckedChange={checked =>
                        handleTypeToggle(option.id.toString(), checked)
                      }
                    />
                    <label
                      htmlFor={`option-${option.id}`}
                      className="text-sm cursor-pointer flex-grow text-foreground"
                    >
                      {renderOption ? renderOption(option) : option[displayKey]}
                    </label>
                  </div>
                ))}
                {options.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground">
                    {MULTISELECT_TEXT.NO_OPTIONS}
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
