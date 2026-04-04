#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "$0")/.."

rg --files \
  -g '*.ts' \
  -g '*.tsx' \
  -g '!**/node_modules/**' \
  -g '!**/dist/**' \
  -g '!**/lib/**' \
  -g '!**/build/**' \
  -g '!**/.next/**' \
  -g '!**/.yarn/**' \
  -g '!**/coverage/**' \
  | xargs awk 'NF { total += 1 } END { print total + 0 }'
