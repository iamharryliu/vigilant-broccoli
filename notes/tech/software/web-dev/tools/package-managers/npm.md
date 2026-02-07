# NPM

```
npm login
npm whoami
npm logout

npm org ls @ORG_NAME
npm org create PACKAGE_NAME
```

## Semantic Versioning

- new-product - First release 1.0.0
- patch release - Backward compatible bug fixes, increment the third digit 1.0.1
- minor release - Backward compatible new features, increment the middle digit and reset last digit to zero, 1.1.0
- major release - changes that break backward compatibility, 2.0.0

## Publishing

### .npmrc

```
registry=https://YOUR_REGISTRY/
//YOUR_REGISTRY/:_authToken=TOKEN
```

### package.json

```
{
    ...
    "publishConfig": {
    "registry": "https://YOUR_REGISTRY/"
    },
}
```

### Scope

NPM packages can be published under the scope of the the username or organization name.

```
npm publish @USERNAME/PACKAGE_NAME
npm publish @ORGANISATION_NAME/PACKAGE_NAME
```

### Commands

```
npm run build && npm publish
npm cache clean --force
```

### Link and Unlink NPM Packages

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

- [Create NPM Package](https://www.youtube.com/watch?v=aUX-KXeQcik)
- [NPM Link and Unlink](https://dev.to/erinbush/npm-linking-and-unlinking-2h1g)
- [Publishing your private npm packages to Gitlab NPM Registry](https://shivamarora.medium.com/publishing-your-private-npm-packages-to-gitlab-npm-registry-39d30a791085)
