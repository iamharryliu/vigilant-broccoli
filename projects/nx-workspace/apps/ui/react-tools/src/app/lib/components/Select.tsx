import { Select as RadixSelect } from '@radix-ui/themes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Select = <T extends string | Record<string, any>>({
  selectedOption,
  setValue,
  options,
  placeholder = 'Select',
  optionDisplayKey,
  optionIdenfifier = 'id',
  displayMapper,
  disabled = false,
}: {
  selectedOption?: T;
  setValue: (value: T) => void;
  options: T[];
  placeholder?: string;
  optionDisplayKey?: string;
  optionIdenfifier?: string;
  displayMapper?: Record<string, string>;
  className?: string;
  disabled?: boolean;
}) => {
  const getOptionValue = (option: T): string => {
    if (typeof option === 'string') {
      return option;
    }
    return optionIdenfifier ? String(option[optionIdenfifier]) : String(option);
  };

  const getOptionDisplay = (option: T): string => {
    if (typeof option === 'string') {
      return displayMapper ? displayMapper[option] : option;
    }
    return optionDisplayKey ? String(option[optionDisplayKey]) : String(option);
  };

  return (
    <RadixSelect.Root
      value={selectedOption ? getOptionValue(selectedOption) : ''}
      disabled={disabled}
      onValueChange={val => {
        const selected = options.find(option => getOptionValue(option) === val);
        if (selected) {
          setValue(selected);
        }
      }}
    >
      <RadixSelect.Trigger placeholder={placeholder} />
      <RadixSelect.Content>
        {options.map(option => (
          <RadixSelect.Item
            key={getOptionValue(option)}
            value={getOptionValue(option)}
          >
            {getOptionDisplay(option)}
          </RadixSelect.Item>
        ))}
      </RadixSelect.Content>
    </RadixSelect.Root>
  );
};
