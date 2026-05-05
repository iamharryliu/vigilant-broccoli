#!/usr/bin/env python3

import json
import os
import subprocess
import sys
from collections import defaultdict

SEVERITY_ORDER = ["critical", "high", "moderate", "low", "info"]
SEVERITY_COLORS = {
    "critical": "\033[1;35m",
    "high": "\033[1;31m",
    "moderate": "\033[1;33m",
    "low": "\033[1;34m",
    "info": "\033[0;37m",
}
RESET = "\033[0m"
BOLD = "\033[1m"

SKIP_DIRS = {
    "node_modules",
    "dist",
    ".next",
    ".nx",
    ".angular",
    ".git",
    "__pycache__",
    ".cache",
    "venv",
    ".venv",
}


def find_package_json_dirs(root):
    dirs = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        if "package.json" in filenames and "node_modules" not in dirpath:
            dirs.append(dirpath)
    return dirs


def run_audit(pkg_dir):
    try:
        result = subprocess.run(
            ["npm", "audit", "--json"],
            cwd=pkg_dir,
            capture_output=True,
            text=True,
            timeout=60,
        )
        data = json.loads(result.stdout)
        vulns = data.get("vulnerabilities", {})
        counts = defaultdict(int)
        for v in vulns.values():
            counts[v["severity"]] += 1
        return dict(counts)
    except Exception:
        return {}


def build_tree(root, pkg_dirs):
    tree = {}
    for pkg_dir in pkg_dirs:
        rel = os.path.relpath(pkg_dir, root)
        parts = rel.split(os.sep) if rel != "." else []
        node = tree
        for part in parts:
            node = node.setdefault(part, {})
        node.setdefault("__counts__", {})
    return tree


def merge_counts(a, b):
    result = dict(a)
    for k, v in b.items():
        result[k] = result.get(k, 0) + v
    return result


def annotate_tree(tree, root, current_path, dir_counts):
    total = {}
    for key, subtree in tree.items():
        if key == "__counts__":
            continue
        child_path = os.path.join(current_path, key)
        child_total = annotate_tree(subtree, root, child_path, dir_counts)
        total = merge_counts(total, child_total)

    abs_path = os.path.join(root, current_path) if current_path else root
    own = dir_counts.get(abs_path, {})
    total = merge_counts(total, own)
    tree["__counts__"] = total
    return total


def format_counts(counts):
    parts = []
    for sev in SEVERITY_ORDER:
        n = counts.get(sev, 0)
        if n:
            color = SEVERITY_COLORS[sev]
            parts.append(f"{color}{n} {sev}{RESET}")
    return ", ".join(parts) if parts else f"\033[0;32m0 vulns{RESET}"


def print_tree(tree, label, prefix="", is_last=True):
    counts = tree.get("__counts__", {})
    if not sum(counts.values()):
        return

    children = [
        (k, v)
        for k, v in tree.items()
        if k != "__counts__" and sum(v.get("__counts__", {}).values())
    ]
    children.sort(key=lambda x: -sum(x[1].get("__counts__", {}).values()))

    connector = "└── " if is_last else "├── "
    print(f"{prefix}{connector}{BOLD}{label}{RESET}  [{format_counts(counts)}]")

    child_prefix = prefix + ("    " if is_last else "│   ")
    for i, (key, subtree) in enumerate(children):
        print_tree(subtree, key, child_prefix, i == len(children) - 1)


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    print(f"Scanning {root} for package.json files...")

    pkg_dirs = find_package_json_dirs(root)
    print(f"Found {len(pkg_dirs)} package locations. Running audits...\n")

    dir_counts = {}
    for pkg_dir in pkg_dirs:
        rel = os.path.relpath(pkg_dir, root)
        label = rel if rel != "." else "(root)"
        print(f"  auditing {label}...", end="\r")
        counts = run_audit(pkg_dir)
        dir_counts[pkg_dir] = counts

    print(" " * 60, end="\r")

    tree = build_tree(root, pkg_dirs)
    annotate_tree(tree, root, "", dir_counts)

    root_name = os.path.basename(root) or root
    total_counts = tree.get("__counts__", {})
    print(f"{BOLD}{root_name}{RESET}  [{format_counts(total_counts)}]")

    children = [
        (k, v)
        for k, v in tree.items()
        if k != "__counts__" and sum(v.get("__counts__", {}).values())
    ]
    children.sort(key=lambda x: -sum(x[1].get("__counts__", {}).values()))
    for i, (key, subtree) in enumerate(children):
        print_tree(subtree, key, "", i == len(children) - 1)


if __name__ == "__main__":
    main()
