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
- A touch or pen tap on the trigger of an open list closes it. Radix alone would close it as an outside pointerdown (pointer events outside the open list are disabled) and then reopen it from the tap's click, so the list flickered and stayed open; `Select` cancels that click when the outside pointerdown landed on the trigger.

## Compatibility

- `selectedOption`, `setValue` and the misspelled `optionIdenfifier` remain supported as deprecated aliases for `value`, `onValueChange` and `optionIdentifier`, retained for external consumers. All workspace callers have migrated to the new props; removing the aliases is a breaking change needing separate authorization.
- An explicitly supplied `value` takes precedence over `selectedOption`, including when it is `undefined`. `onValueChange` takes precedence over `setValue`; only one callback runs. `optionIdentifier` takes precedence over `optionIdenfifier`.
- The component-library demo includes string and object selection, numeric zero, clearing, disabled and long-label controls.
