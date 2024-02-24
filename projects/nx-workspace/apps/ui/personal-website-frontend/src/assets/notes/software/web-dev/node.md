# Node

## Notes

- _tsconfig.json_ - Configuration for typescript compilation. If the files are not being compiled there's no need for a tsconfig file.

## Commands

### General App Commands

Run application.

```
npm i
npm run serve
```

Run application lint, format, test.

```
npm run lint
npm run lint:css
npm run format
npm run test
```

### Package Managing Commands

Build and publish.

```
npm run build && npm publish
```

Link and Unlink NPM Packages

```
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

[Mock Server](https://medium.com/geekculture/setting-up-a-mock-backend-with-angular-13-applications-26a21788f7da))
