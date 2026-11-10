# Input: slurped (`jq -s`) pages of `gh api --paginate
# "repos/<repo>/code-scanning/alerts?state=open&tool_name=CodeQL"`; one unpaginated
# page works too. Arg: `$max` (number), the per-run alert cap.
# Emits `{total, deferred, alerts}` for `cron-agentic-pr-create-codeql-alerts`,
# highest severity first, each alert reduced to the fields the solve prompt needs
# because the prompt is copied into the PR body.
def rank: {critical: 0, high: 1, error: 1, medium: 2, warning: 2, low: 3, note: 3}[. // ""] // 4;
# Alerts from non-security queries carry no security severity, only `rule.severity`.
def severity: .rule.security_severity_level // .rule.severity;

[.[][] | select(.state == "open" and .tool.name == "CodeQL")]
| sort_by([(severity | rank), .number])
| {
    total: length,
    deferred: ([length - $max, 0] | max),
    alerts: [.[:$max][] | {
      number,
      rule: .rule.id,
      severity: severity,
      description: .rule.description,
      path: .most_recent_instance.location.path,
      start_line: .most_recent_instance.location.start_line,
      # One line per alert, and no tag that could close the prompt's untrusted-data block.
      message: (.most_recent_instance.message.text // "" | gsub("\\s+"; " ") | gsub("</?codeql-alerts>"; "") | .[0:300]),
      html_url
    }]
  }
