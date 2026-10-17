# Foundational demos

Dedicated component-library examples for shared controls, surfaces and typography.

## Coverage

- Input and Textarea: labeled editable fields, disabled fields, invalid styling with associated messages, and long content. Error styles are supplied by the demo caller through `className` and `aria-invalid`.
- Checkbox: controlled selection with a status readout, unchecked, checked, disabled, disabled checked, indeterminate, invalid and wrapping-label examples.
- Badge: all four variants across the eight supported colors, both sizes, and a wrapping long label.
- Card: a plain surface, CardContainer with a working header action, a loading skeleton, an empty state and long content.
- Typography: all nine Text and Heading sizes, four weights, supported text colors and a narrow wrapping paragraph. Visual heading sizes remain independent of semantic heading levels.
- Segmented Control: both sizes and an icon/short-label example, each with independent controlled state and a selected-value readout. Its current API does not expose a disabled or error state.

## Navigation and review

- Each demo has a dedicated entry under Components. Avatar and User Avatar remain separate entries.
- DemoSection supplies consistent section headings and spacing across foundational and older multi-example demos, including buttons, avatars, notifications, collapsible lists, status lists, timelines and Select. Preview rows wrap on narrow screens; Avatar and User Avatar keep their independent examples.
- All new section labels, descriptions and status messages use the sandbox's shared i18n dictionary. Selected-value displays remain beside Select controls; option dumps remain omitted.
- Review the entries in both themes with `d`, including while typing into fields, and at mobile widths. Labels and validation messages remain associated with their controls, and disabled controls retain native behavior.
- No external API or persistent demo data is required; changing entries resets local demo state.
