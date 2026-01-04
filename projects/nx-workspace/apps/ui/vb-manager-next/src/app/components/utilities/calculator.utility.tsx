'use client';

import { Flex, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';

interface CalculatorUtilityProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const CalculatorUtility = ({ isOpen, setIsOpen }: CalculatorUtilityProps) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  // eslint-disable-next-line complexity
  const evaluateExpression = (expression: string) => {
    if (!expression.trim()) {
      setResult('');
      return;
    }

    try {
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');

      if (!sanitized) {
        setResult('');
        return;
      }

      let openParens = 0;
      for (const char of sanitized) {
        if (char === '(') openParens++;
        if (char === ')') openParens--;
        if (openParens < 0) {
          setResult('');
          return;
        }
      }

      if (openParens !== 0) {
        setResult('');
        return;
      }

      const evaluated = Function(`'use strict'; return (${sanitized})`)();

      if (
        typeof evaluated === 'number' &&
        !isNaN(evaluated) &&
        isFinite(evaluated)
      ) {
        setResult(evaluated.toString());
      } else {
        setResult('');
      }
    } catch (error) {
      setResult('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    evaluateExpression(value);
  };

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-gray-300 dark:border-gray-700 pt-3"
    >
      <Collapsible.Trigger asChild>
        <button
          className="flex items-center justify-between w-full mb-3 group cursor-pointer"
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          <Text size="3" weight="bold">
            Calculator
          </Text>
          <Text size="1" color="gray" className="group-hover:opacity-70 transition-opacity">
            {isOpen ? '▲' : '▼'}
          </Text>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="flex flex-col gap-3">
        <Flex direction="column" gap="2">
          <TextField.Root
            value={input}
            onChange={handleInputChange}
            placeholder="Enter calculation"
            size="2"
          />
          {result && (
            <Text size="5" weight="bold" align="right">
              = {result}
            </Text>
          )}
        </Flex>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
