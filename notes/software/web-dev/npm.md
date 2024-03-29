# NPM

## Semantic Versioning

- new-product - First release 1.0.0
- patch release - Backward compatible bug fixes, increment the third digit 1.0.1
- minor release - Backward compatible new features, increment the middle digit and reset last digit to zero, 1.1.0
- major release - changes that break backward compatibility, 2.0.0

## Commands

```
npm run build && npm publish
```

```
# Link and Unlink NPM Packages
cd [package]
npm link
cd [project]
npm unlink --no-save [package-name]
```

```
npm i --package-lock-only --workspaces=false
```

## References

[Create NPM Package](https://www.youtube.com/watch?v=aUX-KXeQcik)

[NPM Link and Unlink](https://dev.to/erinbush/npm-linking-and-unlinking-2h1g)
