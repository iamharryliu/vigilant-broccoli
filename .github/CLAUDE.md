# CLAUDE — .github

## Table of Contents

- [Nuances](#nuances)
  - [A double-quoted font family silently kills the whole `style="..."` attribute](#a-double-quoted-font-family-silently-kills-the-whole-style-attribute)

## Nuances

Non-obvious traps in this directory — read the relevant entry **before**
working on the surface it names, not only when something breaks.
[nuance-pattern.md](../docs/nuance-pattern.md) is the convention.

### A double-quoted font family silently kills the whole `style="..."` attribute

`.github/scripts/agentic-solve-email.mjs` builds email HTML by string
concatenation, and the sans stack was written the way every CSS snippet on the
web writes it:

```js
const SANS_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
```

Interpolated into `style="font-family:${SANS_FONT};..."`, the `"` before
`Segoe` closes the attribute. Everything after it — the font size, the colours,
the margins — becomes stray attributes the parser discards, so the element
renders with browser defaults. The symptom is bizarre: headings and body text
come out in a serif face while the class-styled parts of the same document look
fine, and nothing in the CSS is wrong. There is no error anywhere; the HTML is
still well-formed enough to parse.

Any family name needing quotes (`'Segoe UI'`, `'SF Mono'`, `'Helvetica Neue'`)
must use single quotes when the stack can land inside a double-quoted HTML
attribute. Single quotes are equally valid CSS, so the same constant stays
usable in a `<style>` block.
