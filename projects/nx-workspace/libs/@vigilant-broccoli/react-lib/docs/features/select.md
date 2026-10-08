# Select

Typed selection of string, number or object options through the shared Radix-based control.

## Usage

- Import `Select` and `SelectProps` from the public library barrel.
- Pass `value` and `onValueChange` for controlled selection. The callback receives the original option, including numeric `0`, rather than its serialized identifier.
- Pass `value={undefined}` to clear a controlled selection and show the placeholder. Omit both selection props for Radix's uncontrolled behavior.
- For object options, `optionIdentifier` names the unique identifier property (default `id`); `optionDisplayKey` names the visible label property. `renderItem` can render custom option content. Numeric object identifiers may be zero.
- String options use their own value as a label unless `displayMapper` supplies a label; missing mappings fall back to the string. Empty strings are reserved by Radix for the placeholder and must not be included in `options`.
- `className` styles the trigger; `triggerClassName` merges last and takes precedence for conflicting classes. Supply `id` for an associated label or `aria-label` for an accessible name, and translated placeholder text.
- `disabled` prevents opening or changing selection. Portal content retains the originating theme, including changes while open.

## Compatibility

- `selectedOption`, `setValue` and the misspelled `optionIdenfifier` remain supported as deprecated aliases for `value`, `onValueChange` and `optionIdentifier`.
- An explicitly supplied `value` takes precedence over `selectedOption`, including when it is `undefined`. `onValueChange` takes precedence over `setValue`; only one callback runs. `optionIdentifier` takes precedence over `optionIdenfifier`.
- The component-library demo includes string and object selection, numeric zero, clearing, disabled and long-label controls, and legacy selection props.
