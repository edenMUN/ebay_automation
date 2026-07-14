"""PostToolUse hook: type-check the project after Claude edits a .py file.

Solves the "signature drift" problem: when a function's signature changes,
callers elsewhere in the project are easy to miss. Editing one file is not
enough to reveal the breakage, so this hook runs pyright over the *whole*
project (`src` + `run_tests.py`) and reports errors back to Claude.

To avoid nagging about issues that were already there, it diffs the current
errors against a cached baseline and only surfaces *new* ones. A newly broken
call site shows up; pre-existing errors stay silent. The baseline is refreshed
on every run, so once an error is reported it is not repeated.

Fails open (exit 0) whenever anything goes wrong — a missing type checker or a
bad payload must never brick the edit tool.
"""

import json
import os
import subprocess
import sys

# Project root: the hook payload cwd, or CLAUDE_PROJECT_DIR as a fallback.
PROJECT_DIR = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
BASELINE_PATH = os.path.join(PROJECT_DIR, ".claude", "hooks", ".pyright_baseline.json")

# What to type-check. Signature lives in `src`, callers do too; run_tests.py at
# root is the only other Python entry point.
TARGETS = ["src", "run_tests.py"]


def error_key(diag: dict) -> str:
    """Stable identity for a diagnostic, ignoring line number.

    Edits shift line numbers around, so keying on the line would flag every
    pre-existing error as "new" after any edit. File + rule + message is stable
    enough to tell a genuinely new error from one that was already there.
    """
    return "|".join([
        str(diag.get("file", "")),
        str(diag.get("rule", "")),
        str(diag.get("message", "")),
    ])


def run_pyright() -> list[dict] | None:
    """Return pyright's error-severity diagnostics, or None if it couldn't run."""
    # pyright ships as a Node CLI; invoke via npx. On Windows npx is a .cmd, so
    # go through `cmd /c` — subprocess can't exec a .cmd directly.
    base = ["cmd", "/c", "npx"] if os.name == "nt" else ["npx"]
    cmd = [*base, "--yes", "pyright", *TARGETS, "--outputjson"]
    try:
        proc = subprocess.run(
            cmd,
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True,
            timeout=120,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None  # No Node / npx, or pyright hung — fail open.

    try:
        data = json.loads(proc.stdout)
    except (json.JSONDecodeError, ValueError):
        return None

    return [
        d for d in data.get("generalDiagnostics", [])
        if d.get("severity") == "error"
    ]


def load_baseline() -> set[str]:
    try:
        with open(BASELINE_PATH, encoding="utf-8") as fh:
            return set(json.load(fh))
    except (OSError, json.JSONDecodeError, ValueError):
        return set()


def save_baseline(keys: set[str]) -> None:
    try:
        with open(BASELINE_PATH, "w", encoding="utf-8") as fh:
            json.dump(sorted(keys), fh)
    except OSError:
        pass  # Best-effort cache; never fail the hook over it.


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return

    file_path = (payload.get("tool_input") or {}).get("file_path") or ""
    if not file_path.endswith(".py"):
        return  # Only Python edits can cause Python type errors.

    diagnostics = run_pyright()
    if diagnostics is None:
        return  # Type checker unavailable — stay out of the way.

    current = {error_key(d): d for d in diagnostics}
    baseline = load_baseline()
    new_keys = current.keys() - baseline

    # Refresh the baseline to exactly the current set so fixed errors drop out
    # and reported errors are not repeated on the next edit.
    save_baseline(set(current.keys()))

    if not new_keys:
        return

    lines = ["Type check found new error(s) after this edit:\n"]
    for key in new_keys:
        d = current[key]
        rel = os.path.relpath(str(d.get("file", "")), PROJECT_DIR)
        line = d.get("range", {}).get("start", {}).get("line", 0) + 1
        rule = f" ({d.get('rule')})" if d.get("rule") else ""
        msg = " ".join(str(d.get("message", "")).split())
        lines.append(f"  {rel}:{line}{rule} - {msg}")
    lines.append(
        "\nIf you changed a function signature, update its call sites. "
        "Otherwise fix the type error above."
    )

    # Exit code 2 sends stderr back to Claude so it acts on the errors.
    print("\n".join(lines), file=sys.stderr)
    sys.exit(2)


if __name__ == "__main__":
    main()
