"""PreToolUse hook: block Read/Grep from touching .env files.

Reads the hook payload from stdin and, if a Read or Grep call targets a
`.env` file (`.env`, `.env.local`, `.env.production`, ...), emits a deny
decision. Anything else is allowed by staying silent (exit 0).
"""

import json
import re
import sys

# Matches a path segment whose basename is `.env` or `.env.<something>`.
ENV_RE = re.compile(r"(^|[\\/])\.env($|\.)", re.IGNORECASE)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        return  # Fail open: never brick the tool on a malformed payload.

    tool_input = payload.get("tool_input") or {}
    candidates = [
        tool_input.get("file_path"),  # Read
        tool_input.get("path"),       # Grep target path
        tool_input.get("glob"),       # Grep glob filter
    ]

    if any(isinstance(c, str) and ENV_RE.search(c) for c in candidates):
        print(json.dumps({
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": (
                    "Access to .env files is blocked by policy "
                    "(they hold EBAY_USERNAME/EBAY_PASSWORD and other secrets)."
                ),
            }
        }))


if __name__ == "__main__":
    main()
