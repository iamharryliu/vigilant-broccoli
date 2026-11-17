"""Checks a changelog run's edit to CHANGELOG.md before the runner commits it.

Entries are one `## YYYY-MM` section per month, newest first. A run may only
create or edit the sections for the months its pull requests merged in, so a
stray edit cannot rewrite history the run never read.

Usage: changelog-check.py <old CHANGELOG.md> <new CHANGELOG.md> <month>...
"""

import re
import sys

ENTRIES_ANCHOR = "<!-- changelog-entries -->"
MONTH_HEADING = re.compile(r"^## (\d{4}-\d{2})$")
HTML_TAG = re.compile(r"</?(details|summary)\b")


def sections(text):
    _, sep, entries = text.partition(ENTRIES_ANCHOR + "\n")
    if not sep:
        sys.exit("changelog-check: the changelog-entries anchor is missing.")
    found = {}
    order = []
    current = None
    for line in entries.splitlines():
        if line.startswith("## "):
            match = MONTH_HEADING.match(line)
            if not match:
                sys.exit(
                    f"changelog-check: '{line}' is not a '## YYYY-MM' month heading."
                )
            current = match.group(1)
            if current in found:
                sys.exit(f"changelog-check: month {current} appears twice.")
            order.append(current)
            found[current] = []
        elif current:
            found[current].append(line)
    if order != sorted(order, reverse=True):
        sys.exit("changelog-check: month sections are not newest first.")
    return found


def main():
    old_path, new_path, *months = sys.argv[1:]
    with open(old_path) as f:
        old = sections(f.read())
    with open(new_path) as f:
        new_text = f.read()
    new = sections(new_text)
    if HTML_TAG.search(new_text):
        sys.exit("changelog-check: the changelog contains HTML tags.")
    for month in set(old) | set(new):
        if month not in months and old.get(month) != new.get(month):
            sys.exit(
                f"changelog-check: {month} changed, but no pull request in this run merged then."
            )


main()
