#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
  printf 'Usage: %s <file> <line> <column> [workspace]\n' "$0" >&2
  exit 2
fi

source_file="$1"
line="$2"
column="$3"
workspace="${4:-$(pwd)}"

if [[ ! "$line" =~ ^[1-9][0-9]*$ || ! "$column" =~ ^[1-9][0-9]*$ ]]; then
  printf 'Line and column must be positive integers.\n' >&2
  exit 2
fi

if [[ "$source_file" != /* ]]; then
  source_file="$workspace/$source_file"
fi

if [[ ! -f "$source_file" ]]; then
  printf 'Source file does not exist: %s\n' "$source_file" >&2
  exit 1
fi

source_file="$(cd "$(dirname "$source_file")" && pwd)/$(basename "$source_file")"

location="$source_file:$line:$column"
if cursor_bin="$(command -v cursor 2>/dev/null)"; then
  exec "$cursor_bin" -g "$location"
fi

if [[ "$(uname -s)" == "Darwin" && -d "/Applications/Cursor.app" ]]; then
  exec open -a Cursor --args -g "$location"
fi

printf 'Cursor CLI was not found. Install or expose the Cursor command before retrying.\n' >&2
exit 1
