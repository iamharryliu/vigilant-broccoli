'use client';

import { Text, TextField, Button, ScrollArea } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

const HISTORY_STORAGE_KEY = 'calculator-history';

interface HistoryEntry {
  equation: string;
  result: string;
  timestamp: number;
}

const OP_PRECEDENCE: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

const applyOp = (op: string, b: number, a: number): number => {
  if (op === '+') return a + b;
  if (op === '-') return a - b;
  if (op === '*') return a * b;
  return a / b;
};

const evaluateMathExpression = (expr: string): number | null => {
  const values: number[] = [];
  const ops: string[] = [];
  let i = 0;
  let expectOperand = true;

  while (i < expr.length) {
    const ch = expr[i];
    if (ch === ' ') {
      i++;
      continue;
    }
    if (ch >= '0' && ch <= '9') {
      let j = i;
      while (
        j < expr.length &&
        (expr[j] === '.' || (expr[j] >= '0' && expr[j] <= '9'))
      )
        j++;
      const num = Number(expr.slice(i, j));
      if (Number.isNaN(num)) return null;
      values.push(num);
      i = j;
      expectOperand = false;
      continue;
    }
    if (ch === '(') {
      ops.push(ch);
      i++;
      expectOperand = true;
      continue;
    }
    if (ch === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') {
        const b = values.pop();
        const a = values.pop();
        const op = ops.pop();
        if (b === undefined || a === undefined || op === undefined) return null;
        values.push(applyOp(op, b, a));
      }
      if (!ops.length) return null;
      ops.pop();
      i++;
      expectOperand = false;
      continue;
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      if (expectOperand && (ch === '+' || ch === '-')) {
        values.push(0);
      } else if (expectOperand) {
        return null;
      }
      while (
        ops.length &&
        ops[ops.length - 1] !== '(' &&
        OP_PRECEDENCE[ops[ops.length - 1]] >= OP_PRECEDENCE[ch]
      ) {
        const b = values.pop();
        const a = values.pop();
        const op = ops.pop();
        if (b === undefined || a === undefined || op === undefined) return null;
        values.push(applyOp(op, b, a));
      }
      ops.push(ch);
      i++;
      expectOperand = true;
      continue;
    }
    return null;
  }

  while (ops.length) {
    const b = values.pop();
    const a = values.pop();
    const op = ops.pop();
    if (op === '(' || b === undefined || a === undefined || op === undefined)
      return null;
    values.push(applyOp(op, b, a));
  }

  return values.length === 1 ? values[0] : null;
};

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

  const evaluateExpression = (expression: string) => {
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    if (!sanitized) {
      setResult('');
      return;
    }
    const evaluated = evaluateMathExpression(sanitized);
    if (evaluated !== null && isFinite(evaluated)) {
      setResult(evaluated.toString());
    } else {
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
