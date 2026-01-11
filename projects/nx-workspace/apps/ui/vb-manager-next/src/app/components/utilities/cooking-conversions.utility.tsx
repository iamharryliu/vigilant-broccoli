'use client';

import { Flex, Text, TextField } from '@radix-ui/themes';
import { useState } from 'react';

export const CookingConversionsUtilityContent = () => {
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
  const [fahrenheit, setFahrenheit] = useState('');
  const [celsius, setCelsius] = useState('');

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
      setTbsp((num / 3).toFixed(4));
      setCup((num / 48).toFixed(4));
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
      setTsp((num * 3).toFixed(4));
      setCup((num / 16).toFixed(4));
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
      setTsp((num * 48).toFixed(4));
      setTbsp((num * 16).toFixed(4));
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

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    if (value === '') {
      setCelsius('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setCelsius(((num - 32) * 5 / 9).toFixed(2));
    }
  };

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    if (value === '') {
      setFahrenheit('');
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setFahrenheit((num * 9 / 5 + 32).toFixed(2));
    }
  };

  return (
    <>
        {/* Weight: kg, lb */}
        <Flex gap="2">
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">kg</Text>
            <TextField.Root
              type="number"
              value={kg}
              onChange={(e) => handleKgChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">lb</Text>
            <TextField.Root
              type="number"
              value={lb}
              onChange={(e) => handleLbChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
        </Flex>

        {/* Weight: g, ounce */}
        <Flex gap="2">
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">g</Text>
            <TextField.Root
              type="number"
              value={g}
              onChange={(e) => handleGChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">oz</Text>
            <TextField.Root
              type="number"
              value={oz}
              onChange={(e) => handleOzChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
        </Flex>

        {/* Volume: ml, tsp, tbsp, cup */}
        <div className="grid grid-cols-2 gap-2">
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">ml</Text>
            <TextField.Root
              type="number"
              value={ml}
              onChange={(e) => handleMlChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">tsp</Text>
            <TextField.Root
              type="number"
              value={tsp}
              onChange={(e) => handleTspChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">tbsp</Text>
            <TextField.Root
              type="number"
              value={tbsp}
              onChange={(e) => handleTbspChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" color="gray">cup</Text>
            <TextField.Root
              type="number"
              value={cup}
              onChange={(e) => handleCupChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
        </div>

        {/* Length: mm, cm, inch */}
        <Flex gap="2">
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">mm</Text>
            <TextField.Root
              type="number"
              value={mm}
              onChange={(e) => handleMmChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">cm</Text>
            <TextField.Root
              type="number"
              value={cm}
              onChange={(e) => handleCmChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">inch</Text>
            <TextField.Root
              type="number"
              value={inch}
              onChange={(e) => handleInchChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
        </Flex>

        {/* Temperature: Fahrenheit, Celsius */}
        <Flex gap="2">
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">°F</Text>
            <TextField.Root
              type="number"
              value={fahrenheit}
              onChange={(e) => handleFahrenheitChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
          <Flex direction="column" gap="1" className="flex-1">
            <Text size="1" color="gray">°C</Text>
            <TextField.Root
              type="number"
              value={celsius}
              onChange={(e) => handleCelsiusChange(e.target.value)}
              placeholder="0"
              size="1"
            />
          </Flex>
        </Flex>
    </>
  );
};
