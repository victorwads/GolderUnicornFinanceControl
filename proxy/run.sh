#!/bin/bash

yarn proxy-react &
P2=$!

echo "Initializing proxy"
yarn proxy-server &
P1=$!
open https://localhost

# Encerra todos ao sair
trap "echo Encerrando...; kill $P1 $P2; exit" INT TERM

# Espera todos
wait