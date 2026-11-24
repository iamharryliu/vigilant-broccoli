#!/usr/bin/env python3
"""TODO.md row edits the sandbox runners make on the agent's behalf (sourced
through publish-pr.sh). The row format and rules live in docs/todo-pattern.md.

  restore <base file> <todo file> [resolved id...]
      Keeps the agent's added, folded or removed QA rows and its removals of
      the resolved rows; restores every other changed line to the base. Prints
      each dropped change as a "+line" or "-line" diff line.
  follow-ups <metadata file> <todo file>
      Adds the rows declared in the metadata's follow_up_todos. Prints
      "ADDED<TAB>id<TAB>type<TAB>brief" per written row and
      "REJECTED<TAB>reason" per skipped entry.
"""

import difflib
import json
import re
import secrets
import sys

ROW_ID_RE = re.compile(r"^\|\s*([0-9a-f]{6})\s*\|")
QA_ROW_RE = re.compile(r"^\|\s*[0-9a-f]{6}\s*\|\s*QA\s*\|")
HEADER_RE = re.compile(r"^\|\s*ID\s*\|\s*Type\s*\|")
CELL_SPLIT_RE = re.compile(r"(?<!\\)\|")

QA_TYPE = "QA"
# Mirrors TODO_TYPE_ORDER in local-manager-next's constants/todo.ts.
TYPE_ORDER = [
    QA_TYPE,
    "Security",
    "Performance",
    "Maintenance",
    "Chore",
    "Refactor",
    "Feature Enhancements",
    "UI Cleanup",
    "Not so serious",
]
RANKED_PRIORITIES = ["P1", "P2", "P3"]
NA = "NA"
PRIORITY_ORDER = RANKED_PRIORITIES + [NA]
NA_PRIORITY_TYPES = {"Feature Enhancements", "Not so serious"}
AGENTS = ["auto", "assisted", "human"]
HUMAN_AGENT = "human"
EFFORTS = ["S", "M", "L"]
MODELS = ["haiku", "sonnet", "opus"]
DEFAULT_MODEL = "sonnet"
DESCRIPTION_CELL = 8


def read_lines(path):
    try:
        with open(path, encoding="utf-8") as handle:
            return handle.read().splitlines(keepends=True)
    except FileNotFoundError:
        return []


def write_lines(path, lines):
    with open(path, "w", encoding="utf-8") as handle:
        handle.writelines(lines)


def restore(base_path, todo_path, resolved):
    base = read_lines(base_path)
    current = read_lines(todo_path)
    resolved = set(resolved)
    result, dropped = [], []
    matcher = difflib.SequenceMatcher(None, base, current, autojunk=False)
    for tag, b1, b2, c1, c2 in matcher.get_opcodes():
        if tag == "equal":
            result.extend(base[b1:b2])
            continue
        for line in base[b1:b2]:
            row_id = ROW_ID_RE.match(line)
            if QA_ROW_RE.match(line) or (row_id and row_id.group(1) in resolved):
                continue
            result.append(line)
            dropped.append("-" + line.rstrip("\n"))
        for line in current[c1:c2]:
            if QA_ROW_RE.match(line):
                result.append(line)
            else:
                dropped.append("+" + line.rstrip("\n"))
    if result != current:
        write_lines(todo_path, result)
    for line in dropped:
        print(line)


def cells(line):
    return [cell.strip() for cell in CELL_SPLIT_RE.split(line.rstrip("\n"))]


def normalized(text):
    return " ".join(text.replace("\\|", "|").split()).casefold()


def to_cell(text):
    lines = [line.strip() for line in text.replace("\\|", "|").strip().splitlines()]
    return "<br>".join(line for line in lines if line).replace("|", "\\|")


def sort_key(row_type, priority):
    type_rank = (
        TYPE_ORDER.index(row_type) if row_type in TYPE_ORDER else len(TYPE_ORDER)
    )
    priority_rank = (
        PRIORITY_ORDER.index(priority)
        if priority in PRIORITY_ORDER
        else len(PRIORITY_ORDER)
    )
    return (type_rank, priority_rank)


def row_key(line):
    row_cells = cells(line)
    return sort_key(*row_cells[2:4]) if len(row_cells) > 3 else sort_key("", "")


def field(entry, name):
    value = entry.get(name)
    return value.strip() if isinstance(value, str) else ""


def validate(entry, seen_descriptions):
    """Returns the entry's cell values, or a reason it cannot be written."""
    if not isinstance(entry, dict):
        return None, "entry is not an object"
    row_type = field(entry, "type")
    priority = field(entry, "priority")
    agent = field(entry, "agent")
    effort = field(entry, "effort")
    model = field(entry, "model") or (NA if agent == HUMAN_AGENT else DEFAULT_MODEL)
    texts = {
        name: field(entry, name) for name in ("brief", "description", "recommended_fix")
    }
    if row_type == QA_TYPE:
        return (
            None,
            "QA rows are written in TODO.md by the agent, not declared as follow-ups",
        )
    if row_type not in TYPE_ORDER:
        return None, f'type "{row_type}" is not one of {", ".join(TYPE_ORDER[1:])}'
    allowed = [NA] if row_type in NA_PRIORITY_TYPES else RANKED_PRIORITIES
    if priority not in allowed:
        return (
            None,
            f'priority "{priority}" is invalid for {row_type}; use {"/".join(allowed)}',
        )
    if agent not in AGENTS:
        return None, f'agent "{agent}" is not one of {"/".join(AGENTS)}'
    if effort not in EFFORTS:
        return None, f'effort "{effort}" is not one of {"/".join(EFFORTS)}'
    allowed_models = [NA] if agent == HUMAN_AGENT else MODELS
    if model not in allowed_models:
        return (
            None,
            f'model "{model}" is invalid for agent {agent}; use {"/".join(allowed_models)}',
        )
    empty = [name for name, text in texts.items() if not text]
    if empty:
        return None, f'{", ".join(empty)} must be non-empty'
    description = to_cell(texts["description"])
    if normalized(description) in seen_descriptions:
        return None, "its description duplicates an existing TODO.md row"
    return [
        row_type,
        priority,
        agent,
        effort,
        model,
        to_cell(texts["brief"]),
        description,
        to_cell(texts["recommended_fix"]),
    ], None


def follow_ups(meta_path, todo_path):
    try:
        with open(meta_path, encoding="utf-8") as handle:
            meta = json.load(handle)
    except (OSError, ValueError):
        return
    entries = meta.get("follow_up_todos") if isinstance(meta, dict) else None
    if entries in (None, []):
        return
    if not isinstance(entries, list):
        print("REJECTED\tfollow_up_todos must be an array of objects")
        return

    lines = read_lines(todo_path)
    header = next((i for i, line in enumerate(lines) if HEADER_RE.match(line)), None)
    if header is None:
        print("REJECTED\tTODO.md has no backlog table to add follow-up rows to")
        return
    # Rows start after the header and its separator and run to the first non-row line.
    end = header + 2
    while end < len(lines) and lines[end].startswith("|"):
        end += 1
    seen = {
        normalized(row_cells[DESCRIPTION_CELL])
        for row_cells in (cells(lines[i]) for i in range(header + 2, end))
        if len(row_cells) > DESCRIPTION_CELL
    }
    text = "".join(lines)
    added = False

    for number, entry in enumerate(entries, 1):
        values, problem = validate(entry, seen)
        label = f"follow_up_todos[{number}]"
        if problem:
            brief = field(entry, "brief") if isinstance(entry, dict) else ""
            print(f"REJECTED\t{label}{f' ({brief})' if brief else ''}: {problem}")
            continue
        row_id = format(secrets.randbelow(0x1000000), "06x")
        while row_id in text:
            row_id = format(secrets.randbelow(0x1000000), "06x")
        line = "| " + " | ".join([row_id] + values) + " |\n"
        key = sort_key(values[0], values[1])
        # After the last row that sorts with or before it, so rows of one rank keep their order.
        insert_at = next(
            (i for i in range(header + 2, end) if row_key(lines[i]) > key),
            end,
        )
        lines.insert(insert_at, line)
        end += 1
        text += line
        seen.add(normalized(values[6]))
        added = True
        print(f"ADDED\t{row_id}\t{values[0]}\t{values[5]}")
    if added:
        write_lines(todo_path, lines)


if __name__ == "__main__":
    command, args = sys.argv[1], sys.argv[2:]
    if command == "restore":
        restore(args[0], args[1], args[2:])
    elif command == "follow-ups":
        follow_ups(args[0], args[1])
    else:
        sys.exit(f"unknown command: {command}")
