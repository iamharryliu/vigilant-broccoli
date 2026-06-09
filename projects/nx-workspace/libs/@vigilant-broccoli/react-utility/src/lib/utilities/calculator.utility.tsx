'use client';

import { Text, TextField, Button, ScrollArea } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

const HISTORY_STORAGE_KEY = 'calculator-history';

interface HistoryEntry {
  equation: string;
  result: string;
  timestamp: number;
}

export const CalculatorUtilityContent = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const saveToHistory = () => {
    if (!input.trim() || !result) return;

    const newEntry: HistoryEntry = {
      equation: input,
      result,
      timestamp: Date.now(),
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  };

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
    } catch (_error) {
      setResult('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    evaluateExpression(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveToHistory();
  };

  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={handleSubmit}>
        <TextField.Root
          value={input}
          onChange={handleInputChange}
          placeholder="Enter calculation (press Enter to save)"
          size="2"
        />
      </form>
      {result && (
        <Text size="5" weight="bold" align="right">
          = {result}
        </Text>
      )}
      {history.length > 0 && (
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex justify-between items-center">
            <Text size="1" weight="bold" color="gray">
              History
            </Text>
            <Button size="1" variant="ghost" color="red" onClick={clearHistory}>
              Clear
            </Button>
          </div>
          <ScrollArea style={{ maxHeight: '200px' }}>
            <div className="flex flex-col gap-1">
              {history.map(entry => (
                <div
                  className="flex justify-between items-center py-1"
                  key={entry.timestamp}
                  style={{ borderBottom: '1px solid var(--gray-a5)' }}
                >
                  <Text size="1" color="gray">
                    {entry.equation}
                  </Text>
                  <Text size="1" weight="bold" color="blue">
                    = {entry.result}
                  </Text>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
