#!/usr/bin/env python3

import json
import os
import shutil
import subprocess
import sys
from collections import defaultdict

SEVERITY_ORDER = ["critical", "high", "moderate", "low", "info", "pip"]
SEVERITY_COLORS = {
    "critical": "\033[1;35m",
    "high": "\033[1;31m",
    "moderate": "\033[1;33m",
    "low": "\033[1;34m",
    "info": "\033[0;37m",
    "pip": "\033[1;36m",
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

PIP_AUDIT_CMD = shutil.which("pip-audit") or "pipx run pip-audit"


def walk_repo(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        yield dirpath, filenames


def find_package_json_dirs(root):
    return [d for d, files in walk_repo(root) if "package.json" in files]


def find_requirements_files(root):
    return [
        os.path.join(d, f)
        for d, files in walk_repo(root)
        for f in files
        if f.startswith("requirements") and f.endswith(".txt")
    ]


def run_npm_audit(pkg_dir):
    try:
        result = subprocess.run(
            ["npm", "audit", "--json"],
            cwd=pkg_dir,
            capture_output=True,
            text=True,
            timeout=60,
        )
        data = json.loads(result.stdout)
        counts = defaultdict(int)
        for v in data.get("vulnerabilities", {}).values():
            counts[v["severity"]] += 1
        return dict(counts)
    except Exception:
        return {}


def run_pip_audit(req_file):
    try:
        cmd = PIP_AUDIT_CMD.split() + [
            "-r",
            req_file,
            "--format",
            "json",
            "--disable-pip",
            "--no-deps",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        data = json.loads(result.stdout)
        total = sum(len(dep["vulns"]) for dep in data.get("dependencies", []))
        return {"pip": total} if total else {}
    except Exception:
        return {}


def merge_counts(a, b):
    result = dict(a)
    for k, v in b.items():
        result[k] = result.get(k, 0) + v
    return result


def build_tree(root, paths):
    tree = {}
    for path in paths:
        rel = os.path.relpath(path, root)
        node = tree
        for part in rel.split(os.sep) if rel != "." else []:
            node = node.setdefault(part, {})
    return tree


def annotate_tree(tree, root, current_path, dir_counts):
    total = {}
    for key, subtree in tree.items():
        if key == "__counts__":
            continue
        child_total = annotate_tree(
            subtree, root, os.path.join(current_path, key), dir_counts
        )
        total = merge_counts(total, child_total)
    abs_path = os.path.join(root, current_path) if current_path else root
    total = merge_counts(total, dir_counts.get(abs_path, {}))
    tree["__counts__"] = total
    return total


def format_counts(counts):
    parts = [
        f"{SEVERITY_COLORS[sev]}{counts[sev]} {sev}{RESET}"
        for sev in SEVERITY_ORDER
        if counts.get(sev)
    ]
    return ", ".join(parts) if parts else f"\033[0;32m0 vulns{RESET}"


def print_tree(tree, label, prefix="", is_last=True):
    counts = tree.get("__counts__", {})
    if not sum(counts.values()):
        return
    connector = "└── " if is_last else "├── "
    print(f"{prefix}{connector}{BOLD}{label}{RESET}  [{format_counts(counts)}]")
    child_prefix = prefix + ("    " if is_last else "│   ")
    children = sorted(
        [
            (k, v)
            for k, v in tree.items()
            if k != "__counts__" and sum(v.get("__counts__", {}).values())
        ],
        key=lambda x: -sum(x[1]["__counts__"].values()),
    )
    for i, (key, subtree) in enumerate(children):
        print_tree(subtree, key, child_prefix, i == len(children) - 1)


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    pkg_dirs = find_package_json_dirs(root)
    req_files = find_requirements_files(root)
    print(
        f"Found {len(pkg_dirs)} npm locations, {len(req_files)} requirements files. Running audits...\n"
    )

    dir_counts = {}
    for pkg_dir in pkg_dirs:
        label = os.path.relpath(pkg_dir, root) or "(root)"
        print(f"  npm: {label}...", end="\r")
        dir_counts[pkg_dir] = merge_counts(
            dir_counts.get(pkg_dir, {}), run_npm_audit(pkg_dir)
        )

    for req_file in req_files:
        req_dir = os.path.dirname(req_file)
        print(f"  pip: {os.path.relpath(req_file, root)}...", end="\r")
        dir_counts[req_dir] = merge_counts(
            dir_counts.get(req_dir, {}), run_pip_audit(req_file)
        )

    print(" " * 70, end="\r")

    all_dirs = set(pkg_dirs) | {os.path.dirname(f) for f in req_files}
    tree = build_tree(root, all_dirs)
    annotate_tree(tree, root, "", dir_counts)

    root_name = os.path.basename(root) or root
    print(f"{BOLD}{root_name}{RESET}  [{format_counts(tree.get('__counts__', {}))}]")
    children = sorted(
        [
            (k, v)
            for k, v in tree.items()
            if k != "__counts__" and sum(v.get("__counts__", {}).values())
        ],
        key=lambda x: -sum(x[1]["__counts__"].values()),
    )
    for i, (key, subtree) in enumerate(children):
        print_tree(subtree, key, "", i == len(children) - 1)


if __name__ == "__main__":
    main()
