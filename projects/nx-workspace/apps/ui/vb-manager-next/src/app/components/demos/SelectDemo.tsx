import { Select } from '@vigilant-broccoli/react-lib';
import { useState } from 'react';
import { Flex, Heading } from '@radix-ui/themes';

interface Person {
  id: number;
  name: string;
  role: string;
}

export const SelectDemo = () => {
  const [selectedString, setSelectedString] = useState('');
  const SELECT_STRING_OPTIONS = ['Apple', 'Banana', 'Orange', 'Grape', 'Mango'];

  const [selectedNumber, setSelectedNumber] = useState<number>();
  const SELECT_NUMBER_OPTIONS = [1, 2, 3, 4, 5];

  const [selectedPerson, setSelectedPerson] = useState<Person>();
  const SELECT_PERSON_OPTIONS: Person[] = [
    { id: 1, name: 'Alice Johnson', role: 'Developer' },
    { id: 2, name: 'Bob Smith', role: 'Designer' },
    { id: 3, name: 'Charlie Brown', role: 'Manager' },
    { id: 4, name: 'Diana Prince', role: 'Product Owner' },
  ];

  return (
    <Flex direction="column" gap="6">
      <div className="flex items-start gap-4">
        <div className="w-32 shrink-0 pt-2">
          <Heading size="3">Simple String</Heading>
        </div>
        <Select
          selectedOption={selectedString}
          setValue={setSelectedString}
          options={SELECT_STRING_OPTIONS}
        />
        <div className="flex gap-4 text-xs">
          <div>
            <div className="text-gray-500 dark:text-gray-400 mb-1">Options:</div>
            <pre className="text-gray-500 dark:text-gray-400">
              {JSON.stringify(SELECT_STRING_OPTIONS, null, 2)}
            </pre>
          </div>
          {selectedString && (
            <div>
              <div className="text-gray-500 dark:text-gray-400 mb-1">Selected:</div>
              <pre className="text-gray-500 dark:text-gray-400">
                {JSON.stringify(selectedString, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-32 shrink-0 pt-2">
          <Heading size="3">Number</Heading>
        </div>
        <Select
          selectedOption={selectedNumber}
          setValue={setSelectedNumber}
          options={SELECT_NUMBER_OPTIONS}
        />
        <div className="flex gap-4 text-xs">
          <div>
            <div className="text-gray-500 dark:text-gray-400 mb-1">Options:</div>
            <pre className="text-gray-500 dark:text-gray-400">
              {JSON.stringify(SELECT_NUMBER_OPTIONS, null, 2)}
            </pre>
          </div>
          {selectedNumber !== undefined && (
            <div>
              <div className="text-gray-500 dark:text-gray-400 mb-1">Selected:</div>
              <pre className="text-gray-500 dark:text-gray-400">
                {JSON.stringify(selectedNumber, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="w-32 shrink-0 pt-2">
          <Heading size="3">Object</Heading>
        </div>
        <Select
          selectedOption={selectedPerson}
          setValue={setSelectedPerson}
          options={SELECT_PERSON_OPTIONS}
          optionDisplayKey="name"
        />
        <div className="flex gap-4 text-xs">
          <div>
            <div className="text-gray-500 dark:text-gray-400 mb-1">Options:</div>
            <pre className="text-gray-500 dark:text-gray-400">
              {JSON.stringify(SELECT_PERSON_OPTIONS, null, 2)}
            </pre>
          </div>
          {selectedPerson && (
            <div>
              <div className="text-gray-500 dark:text-gray-400 mb-1">Selected:</div>
              <pre className="text-gray-500 dark:text-gray-400">
                {JSON.stringify(selectedPerson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Flex>
  );
};
