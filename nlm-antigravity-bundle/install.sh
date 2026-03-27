#!/usr/bin/env bash
set -euo pipefail

echo "[1/6] Checking Node/npm"
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm not found. Install Node.js first." >&2
  exit 1
fi

echo "[2/6] Installing notebooklm-mcp-cli"
npm i -g notebooklm-mcp-cli

echo "[3/6] Preparing Antigravity dirs"
mkdir -p "$HOME/.gemini/antigravity/skills"

echo "[4/6] Wiring MCP into Antigravity"
nlm setup add antigravity

echo "[5/6] Installing NotebookLM skill"
nlm skill install antigravity --level user

echo "[6/6] Verifying"
nlm setup list

echo
echo "Done. Next steps:"
echo "  1) Run: nlm login --profile work"
echo "  2) Verify: nlm login --check --profile work"
echo "  3) Restart Antigravity"
echo "  4) In Antigravity chat: run notebook_list and confirm your notebook ID is visible"
