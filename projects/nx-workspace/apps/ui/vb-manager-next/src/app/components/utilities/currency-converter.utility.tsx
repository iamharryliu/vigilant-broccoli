'use client';

import { Flex, Text, TextField, Button, ScrollArea, Select } from '@radix-ui/themes';
import { useState, useEffect } from 'react';

const HISTORY_STORAGE_KEY = 'currency-converter-history';
const API_BASE_URL = 'https://api.fxratesapi.com';

interface HistoryEntry {
  amount: string;
  fromCurrency: string;
  toCurrency: string;
  result: string;
  timestamp: number;
}

const POPULAR_CURRENCIES = [
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'USD', name: 'US Dollar' },
];

export const CurrencyConverterUtilityContent = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const saveToHistory = (convertedResult: string) => {
    if (!amount.trim() || !convertedResult) return;

    const newEntry: HistoryEntry = {
      amount,
      fromCurrency,
      toCurrency,
      result: convertedResult,
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

  const convertCurrency = async () => {
    if (!amount.trim()) {
      setResult('');
      return '';
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      setResult('');
      return '';
    }

    setLoading(true);
    const response = await fetch(
      `${API_BASE_URL}/latest?base=${fromCurrency}&currencies=${toCurrency}`
    );
    const data = await response.json();

    let convertedValue = '';
    if (data.rates && data.rates[toCurrency]) {
      const rate = data.rates[toCurrency];
      const converted = numAmount * rate;
      convertedValue = converted.toFixed(2);
      setResult(convertedValue);
    } else {
      setResult('');
    }
    setLoading(false);
    return convertedValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    setResult('');
  };

  const handleFromCurrencyChange = (value: string) => {
    setFromCurrency(value);
    setResult('');
  };

  const handleToCurrencyChange = (value: string) => {
    setToCurrency(value);
    setResult('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    convertCurrency().then((convertedValue) => {
      saveToHistory(convertedValue);
    });
  };

  return (
    <Flex direction="column" gap="2">
      <form onSubmit={handleSubmit}>
        <Flex gap="2" align="center">
          <Select.Root value={fromCurrency} onValueChange={handleFromCurrencyChange}>
            <Select.Trigger />
            <Select.Content>
              {POPULAR_CURRENCIES.map((currency) => (
                <Select.Item key={currency.code} value={currency.code}>
                  {currency.code}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <TextField.Root
            value={amount}
            onChange={handleAmountChange}
            placeholder="Amount"
            size="2"
            type="number"
            step="0.01"
            style={{ flex: 1 }}
          />
          <Select.Root value={toCurrency} onValueChange={handleToCurrencyChange}>
            <Select.Trigger />
            <Select.Content>
              {POPULAR_CURRENCIES.map((currency) => (
                <Select.Item key={currency.code} value={currency.code}>
                  {currency.code}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
      </form>
      {result && !loading && (
        <Text size="5" weight="bold" align="right">
          {amount} {fromCurrency} = {result} {toCurrency}
        </Text>
      )}
      {loading && (
        <Text size="2" color="gray" align="right">
          Converting...
        </Text>
      )}
      {history.length > 0 && (
        <Flex direction="column" gap="1" mt="2">
          <Flex justify="between" align="center">
            <Text size="1" weight="bold" color="gray">
              History
            </Text>
            <Button size="1" variant="ghost" color="red" onClick={clearHistory}>
              Clear
            </Button>
          </Flex>
          <ScrollArea style={{ maxHeight: '200px' }}>
            <Flex direction="column" gap="1">
              {history.map((entry) => (
                <Flex key={entry.timestamp} justify="between" align="center" py="1" style={{ borderBottom: '1px solid var(--gray-a5)' }}>
                  <Text size="1" color="gray">
                    {entry.amount} {entry.fromCurrency} → {entry.toCurrency}
                  </Text>
                  <Text size="1" weight="bold" color="blue">
                    {entry.result} {entry.toCurrency}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </ScrollArea>
        </Flex>
      )}
    </Flex>
  );
};
