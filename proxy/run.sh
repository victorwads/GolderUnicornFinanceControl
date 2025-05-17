#!/bin/bash

CERT_DIR="./certs"
CERT="$CERT_DIR/localhost.pem"
KEY="$CERT_DIR/localhost-key.pem"

# Verifica se mkcert está instalado, senão instala com brew
if ! command -v mkcert &> /dev/null; then
  echo "mkcert não encontrado. Instalando com Homebrew..."
  if ! command -v brew &> /dev/null; then
    echo "Homebrew não encontrado. Por favor, instale o Homebrew manualmente em https://brew.sh/"
    exit 1
  fi
  brew install mkcert
  mkcert -install
fi

# Cria certificados se não existirem
if [ ! -f "$CERT" ] || [ ! -f "$KEY" ]; then
  echo "Gerando certificados com mkcert..."
  mkdir -p "$CERT_DIR"
  mkcert -key-file "$KEY" -cert-file "$CERT" localhost
fi

# Inicia proxies
echo "Iniciando proxies HTTPS..."

yarn proxy-react &
P2=$!

sleep 1
yarn proxy-server &
P1=$!
open https://localhost

# Encerra todos ao sair
trap "echo Encerrando...; kill $P1 $P2; exit" INT TERM

# Espera todos
wait