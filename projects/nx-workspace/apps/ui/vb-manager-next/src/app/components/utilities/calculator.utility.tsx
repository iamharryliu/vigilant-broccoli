'use client';

import { Flex, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';

export const CalculatorUtilityContent = () => {
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
  );
};
