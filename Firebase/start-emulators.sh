#!/bin/sh

set -eu

cd /app/Backend

echo "[firebase] Installing Backend dependencies..."
yarn install --frozen-lockfile

echo "[firebase] Building Backend functions..."
yarn build

cd /app

exec firebase emulators:start --import=./Firebase/data --export-on-exit=./Firebase/data
