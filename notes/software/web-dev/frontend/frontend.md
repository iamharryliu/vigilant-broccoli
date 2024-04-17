# Frontend Developer

## What is frontend development?

- clientside

## Golden Rules

- Never store secrets in a clientside application.

## HTML

Used to create and organize the building blocks of a web page. Think headers, paragraphs, tables, navbars, footers, etc.

## CSS

Used to style a web page. Think color, font, spacing, size, borders, etc.

## View Encapsulation

There are 3 view encapsulation modes for Angular, Emulate, None, and ShadowDOM.

### Emulated(default)

- CSS generated inside of head tag of web application.

### None

- Styles are not encapsulated making it effectively global styling.
- This style can affect elements outside the component and should be used in cases where you don't care about styling encapsulation.

### ShadowDom

- Strongest form of encapsulation.
- Useful for building reusable components where strict style encapsulation is necessary.
- Not supported by some legacy browsers
- CSS generated inside of DOM.

## Frameworks

### Angular

- full fledged framework
- opinionated
- has out of the box features to get started

### React

- a library
- less opinionated
- generally requires using other dependecies (libraries, tools, etc..)
