'use client';

import { useState } from 'react';
import { Card, Flex, TextField, Text } from '@radix-ui/themes';

export default function Calculator() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  // eslint-disable-next-line complexity
  const evaluateExpression = (expression: string) => {
    if (!expression.trim()) {
      setResult('');
      return;
    }

    try {
      // Remove any characters that aren't numbers, operators, parentheses, or decimal points
      const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');

      if (!sanitized) {
        setResult('');
        return;
      }

      // Check for valid expression structure
      // Ensure we have at least one number and balanced parentheses
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

      // Evaluate the expression using Function constructor (safer than eval)
      const evaluated = Function(`'use strict'; return (${sanitized})`)();

      // Check if result is a valid number
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
      // If evaluation fails, just show nothing
      setResult('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    evaluateExpression(value);
  };

  return (
    <Card className="w-full">
      <Flex direction="column" gap="2" p="4">
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
    </Card>
  );
}
