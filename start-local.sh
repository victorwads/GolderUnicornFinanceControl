#!/bin/zsh

cleanup() {
  echo "Encerrando processos..."
  kill $WEB_PID $PROXY_PID $FIREBASE_PID 2>/dev/null
  exit
}

export CRYPTO_JWT_SIGN_SECRET=sometestsecret
export CRYPTO_JWT_ENCRYPT_SECRET=sometestsecret

trap cleanup SIGINT SIGTERM EXIT

# Emulators
cd Backend
yarn install
yarn build
cd -
cd Firebase
firebase emulators:start --import=./emulators/data --export-on-exit=./emulators/data &
FIREBASE_PID=$!
cd -

# Web
cd Web
BROWSER=none yarn start &
WEB_PID=$!
cd -

# Proxy
cd Web
yarn install
yarn proxy --local &
PROXY_PID=$!
cd -

echo "Processos iniciados:"
echo "Proxy: $PROXY_PID"
echo "Web: $WEB_PID"
echo "Firebase: $FIREBASE_PID"

wait $PROXY_PID
wait $WEB_PID
wait $FIREBASE_PID