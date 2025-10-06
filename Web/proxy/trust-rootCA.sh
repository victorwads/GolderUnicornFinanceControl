#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CERT_PATH="${1:-$SCRIPT_DIR/certs/rootCA.pem}"

if [ ! -f "$CERT_PATH" ]; then
  echo "🔍 Certificate not found: $CERT_PATH"
  echo "🐳 Trying to start docker compose to generate certificate..."
  docker compose up -d
  ATTEMPTS=0
  MAX_ATTEMPTS=100
  while [ ! -f "$CERT_PATH" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    ATTEMPTS=$((ATTEMPTS+1))
  echo "⏳ Waiting for certificate... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 5
  done
  if [ ! -f "$CERT_PATH" ]; then
    echo "❌ Certificate not found after $MAX_ATTEMPTS attempts."
    exit 1
  fi
fi

OS="$(uname -s)"

if [[ "$OS" == "Darwin" ]]; then
  echo "🍏 Detected MacOS"
  echo "🔑 You will be prompted for your administrator password several times."
  sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_PATH"
  echo "✅ Certificate installed and trusted in the System Keychain."
elif [[ -f /etc/arch-release ]]; then
  echo "🎩 Detected Arch Linux"
  sudo cp "$CERT_PATH" /etc/ca-certificates/trust-source/anchors/
  sudo trust extract-compat
  echo "✅ Certificate installed and trusted on Arch."
elif [[ -f /etc/debian_version ]] || [[ -f /etc/linuxmint/info ]]; then
  echo "🌱 Detected Debian/Ubuntu/Mint"
  sudo cp "$CERT_PATH" /usr/local/share/ca-certificates/
  sudo update-ca-certificates
  echo "✅ Certificate installed and trusted on Debian/Ubuntu/Mint."
elif [[ -f /etc/fedora-release ]] || [[ -f /etc/redhat-release ]]; then
  echo "🎩 Detected Fedora/RHEL/CentOS"
  sudo cp "$CERT_PATH" /etc/pki/ca-trust/source/anchors/
  sudo update-ca-trust
  echo "✅ Certificate installed and trusted on Fedora/RHEL/CentOS."
else
  echo "🤔 Operating system not automatically recognized."
  echo "📝 Please install the certificate manually: $CERT_PATH"
  exit 2
fi

echo ""
echo "------------------------------------------"
echo "🎉 Done! Please restart your browser."
echo "------------------------------------------"
