'use client';

import { useState } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';

export default function CookingCalculatorCard() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Conversion states
  const [kg, setKg] = useState('');
  const [lb, setLb] = useState('');
  const [g, setG] = useState('');
  const [oz, setOz] = useState('');
  const [ml, setMl] = useState('');
  const [tsp, setTsp] = useState('');
  const [tbsp, setTbsp] = useState('');
  const [cup, setCup] = useState('');
  const [mm, setMm] = useState('');
  const [cm, setCm] = useState('');
  const [inch, setInch] = useState('');

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

  // Conversion handlers
  const handleKgChange = (value: string) => {
    setKg(value);
    if (value === '') {
      setLb('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setLb((num * 2.20462).toFixed(4));
    }
  };

  const handleLbChange = (value: string) => {
    setLb(value);
    if (value === '') {
      setKg('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setKg((num / 2.20462).toFixed(4));
    }
  };

  const handleGChange = (value: string) => {
    setG(value);
    if (value === '') {
      setOz('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setOz((num * 0.035274).toFixed(4));
    }
  };

  const handleOzChange = (value: string) => {
    setOz(value);
    if (value === '') {
      setG('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setG((num / 0.035274).toFixed(4));
    }
  };

  const handleMlChange = (value: string) => {
    setMl(value);
    if (value === '') {
      setTsp('');
      setTbsp('');
      setCup('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setTsp((num / 4.92892).toFixed(4));
      setTbsp((num / 14.7868).toFixed(4));
      setCup((num / 236.588).toFixed(4));
    }
  };

  const handleTspChange = (value: string) => {
    setTsp(value);
    if (value === '') {
      setMl('');
      setTbsp('');
      setCup('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const mlValue = num * 4.92892;
      setMl(mlValue.toFixed(4));
      setTbsp((mlValue / 14.7868).toFixed(4));
      setCup((mlValue / 236.588).toFixed(4));
    }
  };

  const handleTbspChange = (value: string) => {
    setTbsp(value);
    if (value === '') {
      setMl('');
      setTsp('');
      setCup('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const mlValue = num * 14.7868;
      setMl(mlValue.toFixed(4));
      setTsp((mlValue / 4.92892).toFixed(4));
      setCup((mlValue / 236.588).toFixed(4));
    }
  };

  const handleCupChange = (value: string) => {
    setCup(value);
    if (value === '') {
      setMl('');
      setTsp('');
      setTbsp('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      const mlValue = num * 236.588;
      setMl(mlValue.toFixed(4));
      setTsp((mlValue / 4.92892).toFixed(4));
      setTbsp((mlValue / 14.7868).toFixed(4));
    }
  };

  const handleMmChange = (value: string) => {
    setMm(value);
    if (value === '') {
      setCm('');
      setInch('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setCm((num / 10).toFixed(4));
      setInch((num / 25.4).toFixed(4));
    }
  };

  const handleCmChange = (value: string) => {
    setCm(value);
    if (value === '') {
      setMm('');
      setInch('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setMm((num * 10).toFixed(4));
      setInch((num / 2.54).toFixed(4));
    }
  };

  const handleInchChange = (value: string) => {
    setInch(value);
    if (value === '') {
      setMm('');
      setCm('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setMm((num * 25.4).toFixed(4));
      setCm((num * 2.54).toFixed(4));
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      {/* Calculator Section */}
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-sm font-semibold text-gray-700">Calculator</h3>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter calculation"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {result && (
          <div className="text-right text-xl font-semibold text-gray-800">
            = {result}
          </div>
        )}
      </div>

      {/* Cooking Conversions Section */}
      <Collapsible.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        className="border-t pt-4"
      >
        <Collapsible.Trigger asChild>
          <button
            className="flex items-center justify-between w-full mb-4 group cursor-pointer"
            aria-label={isOpen ? 'Collapse' : 'Expand'}
          >
            <h3 className="text-sm font-semibold text-gray-700">
              Cooking Conversions
            </h3>
            <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
              {isOpen ? '▲' : '▼'}
            </span>
          </button>
        </Collapsible.Trigger>

        <Collapsible.Content className="flex flex-col gap-4">
          {/* Weight: kg, lb */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">kg</label>
              <input
                type="number"
                value={kg}
                onChange={(e) => handleKgChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">lb</label>
              <input
                type="number"
                value={lb}
                onChange={(e) => handleLbChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Weight: g, ounce */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">g</label>
              <input
                type="number"
                value={g}
                onChange={(e) => handleGChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">oz</label>
              <input
                type="number"
                value={oz}
                onChange={(e) => handleOzChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Volume: ml, tsp, tbsp, cup */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">ml</label>
              <input
                type="number"
                value={ml}
                onChange={(e) => handleMlChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">tsp</label>
              <input
                type="number"
                value={tsp}
                onChange={(e) => handleTspChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">tbsp</label>
              <input
                type="number"
                value={tbsp}
                onChange={(e) => handleTbspChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">cup</label>
              <input
                type="number"
                value={cup}
                onChange={(e) => handleCupChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Length: mm, cm, inch */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">mm</label>
              <input
                type="number"
                value={mm}
                onChange={(e) => handleMmChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">cm</label>
              <input
                type="number"
                value={cm}
                onChange={(e) => handleCmChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">inch</label>
              <input
                type="number"
                value={inch}
                onChange={(e) => handleInchChange(e.target.value)}
                placeholder="0"
                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
