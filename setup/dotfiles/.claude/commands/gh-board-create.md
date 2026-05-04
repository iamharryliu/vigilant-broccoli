Create a new GitHub issue in `iamharryliu/vigilant-broccoli` and add it to the master board and matching sub-board.

Args: title, area name, and optional body. Valid area names = the options of master's `Area` field (look them up at runtime).
Example: "feat: add dark mode" vb-manager-next
Example: "security: rotate API keys" security "Rotate all keys in GCP Secret Manager"

Steps:

1. `gh issue create --repo iamharryliu/vigilant-broccoli --title <title> --body <body>` to create the issue.
2. Add the new issue to the master board `vigilant-broccoli` and set its `Area` field.
3. If a sub-board exists with a title matching the area, add it there too.
4. Default `Status` to `Backlog` on all boards unless told otherwise.
