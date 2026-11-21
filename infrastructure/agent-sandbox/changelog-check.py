"""Checks a changelog run's edit to CHANGELOG.md before the runner commits it.

Entries are one `<details><summary>Month YYYY</summary>` block per month,
newest first. A run may only
create or edit the sections for the months its pull requests merged in, so a
stray edit cannot rewrite history the run never read. A month already linking
one of those pull requests is also editable: a PR writes its own bullet into
the month it was authored in, which can precede its merge month.

Usage: changelog-check.py <old CHANGELOG.md> <new CHANGELOG.md> <month|#PR>...
"""

import re
import sys
from datetime import datetime

ENTRIES_ANCHOR = "<!-- changelog-entries -->"
SUMMARY = re.compile(r"^<summary>([A-Z][a-z]+ \d{4})</summary>$")
HTML_TAG = re.compile(r"</?(details|summary)\b")
OPEN, CLOSE = "<details>", "</details>"


def month_key(label):
    try:
        return datetime.strptime(label, "%B %Y").strftime("%Y-%m")
    except ValueError:
        sys.exit(f"changelog-check: '{label}' is not a 'Month YYYY' summary.")


def sections(text):
    _, sep, entries = text.partition(ENTRIES_ANCHOR + "\n")
    if not sep:
        sys.exit("changelog-check: the changelog-entries anchor is missing.")
    lines = entries.splitlines()
    found = {}
    order = []
    index = 0
    while index < len(lines):
        line = lines[index]
        index += 1
        if not line.strip():
            continue
        if line != OPEN:
            sys.exit(f"changelog-check: '{line}' is outside a month <details> block.")
        match = SUMMARY.match(lines[index]) if index < len(lines) else None
        if not match:
            sys.exit(
                f"changelog-check: a <details> block lacks a '<summary>Month YYYY</summary>' line."
            )
        month = month_key(match.group(1))
        if month in found:
            sys.exit(f"changelog-check: month {month} appears twice.")
        order.append(month)
        index += 1
        body = []
        while index < len(lines) and lines[index] != CLOSE:
            if HTML_TAG.search(lines[index]):
                sys.exit(f"changelog-check: {month} contains nested HTML tags.")
            body.append(lines[index])
            index += 1
        if index == len(lines):
            sys.exit(f"changelog-check: the {month} block is missing </details>.")
        index += 1
        found[month] = body
    if order != sorted(order, reverse=True):
        sys.exit("changelog-check: month sections are not newest first.")
    return found


def main():
    old_path, new_path, *scope = sys.argv[1:]
    months = {arg for arg in scope if not arg.startswith("#")}
    pr_links = [f"/pull/{arg[1:]})" for arg in scope if arg.startswith("#")]
    with open(old_path) as f:
        old = sections(f.read())
    months |= {
        month
        for month, lines in old.items()
        if any(link in line for line in lines for link in pr_links)
    }
    with open(new_path) as f:
        new = sections(f.read())
    for month in set(old) | set(new):
        if month not in months and old.get(month) != new.get(month):
            sys.exit(
                f"changelog-check: {month} changed, but no pull request in this run merged then or is linked there."
            )


main()
