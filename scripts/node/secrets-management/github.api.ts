export const GithubAPICommand = {
  setSetSecret: (repo: string, key: string, value: string) => {
    return `gh secret set ${key} --repo ${repo} --body "${value}"`;
  },
};
