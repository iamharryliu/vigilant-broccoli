# Gitlab

## Package Registry

```
# Set URL for your scoped packages.
# For example package with name `@my-org/my-package` will use this URL for download
@my-org:registry=https://gitlab.com/api/v4/packages/npm/
@my-org/my-package:registry=https://gitlab.com/api/v4/packages/npm/

# Add the token for the scoped packages URL. This will allow you to download
# `@my-org/` packages from private projects.
'//gitlab.com/api/v4/packages/npm/:_authToken'="${GITLAB_AUTH_TOKEN}"

# Add token for uploading to the registry. Replace <your-project-id>
# with the project you want your package to be uploaded to.
'//gitlab.com/api/v4/projects/<your-project-id>/packages/npm/:_authToken'="${GITLAB_AUTH_TOKEN}"
```

[Reference](https://shivamarora.medium.com/publishing-your-private-npm-packages-to-gitlab-npm-registry-39d30a791085)
