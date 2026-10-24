# GitHub repositories

The home page's GitHub card opens `/github`, listing all public repositories owned by `iamharryliu` in GitHub's full-name order. The browser fetches every page from the public GitHub REST API without credentials. Repository names and descriptions come from GitHub; loading, empty results and API errors have localized messages.

Selecting a repository opens `/github/:repo` in the shared README viewer used by npm packages and Docker images. The GitHub README endpoint selects the default branch and README filename and returns raw Markdown. Each detail page uses the repository name as its title, includes a View on GitHub link and breadcrumbs back to the repository list, and displays fetch failures or empty content.

GitHub's unauthenticated API rate limits apply. A repository without a README returns a fetch error, while the external repository link remains available.
