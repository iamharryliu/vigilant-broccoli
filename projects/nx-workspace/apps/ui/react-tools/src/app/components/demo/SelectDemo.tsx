import { Card, Heading } from '@radix-ui/themes';
import { Select } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';

export const SelectDemo = () => {
  const [selectedString, setSelectedString] = useState('');
  const SELECT_STRING_OPTIONS = ['Option 1', 'Option 2', 'Option 3'];
  const [selectedNumber, setSelectedNumber] = useState(1);
  const SELECT_NUMBER_OPTIONS = [1, 2, 3];
  const [selectedOption, setSelectedOption] = useState<{
    id: number;
    name: string;
  }>();
  const SELECT_OPTIONS = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' },
  ];

  return (
    <>
      <Heading>Select Demo</Heading>
      <div className="flex space-x-4">
        <Card>
          <Heading size="2">Select String</Heading>
          <Select
            selectedOption={selectedString}
            setValue={setSelectedString}
            options={SELECT_STRING_OPTIONS}
          />
          <p>Selected String: {selectedString}</p>
        </Card>
        <Card>
          <Heading size="2">Select Number</Heading>
          <Select
            selectedOption={selectedNumber}
            setValue={setSelectedNumber}
            options={SELECT_NUMBER_OPTIONS}
          />
          <p>Selected Number: {selectedNumber}</p>
        </Card>
        <Card>
          <Heading size="2">Select Object</Heading>
          <Select
            selectedOption={selectedOption}
            setValue={setSelectedOption}
            options={SELECT_OPTIONS}
            optionDisplayKey="name"
          />

          <p>Selected Option: {JSON.stringify(selectedOption)}</p>
        </Card>
      </div>
    </>
  );
};
