# 🔐 react-firebase-local-proxy

Um proxy reverso local com suporte a HTTPS, WebSockets e multiplexação inteligente de caminhos para desenvolvimento com React + Firebase Emulator Suite, acessível a partir de dispositivos móveis em rede local.

## ✨ Funcionalidades

- HTTPS local com certificado gerado automaticamente via `mkcert`
- Suporte completo a WebSockets (React Dev Server)
- Multiplexação inteligente de requisições por URL (ex: `/firestore`, `/auth`)
- Redirecionamento automático de HTTP para HTTPS
- Acesso confiável a partir de celulares e outros dispositivos da mesma rede
- Sem necessidade de mudar as portas dos serviços Firebase
- Totalmente compatível com React (`react-scripts`) e Firebase Emulator Suite

## 🚀 Como usar

1. Instale as dependências:

```bash
yarn global add mkcert http-proxy
brew install mkcert
```

2. Clone este repositório:

```bash
git clone https://github.com/seu-usuario/react-firebase-local-proxy
cd react-firebase-local-proxy
```

3. Gere os certificados e inicie o proxy:

```bash
./runProxy.sh
```

4. Em outro terminal, inicie o React:

```bash
yarn start
```

5. Acesse pelo navegador ou celular:
```
https://<SEU_IP_LOCAL>
```

## 📁 Estrutura esperada de portas

| Serviço     | Porta original | Caminho esperado na URL       |
|-------------|----------------|-------------------------------|
| React       | 3000           | `/` (default)                 |
| Firestore   | 8008           | `/firestore`                 |
| Auth        | 9099           | `/auth`                      |
| Hosting     | 8010           | `/hosting`                   |

## ⚙️ Variáveis de ambiente recomendadas (.env)

```env
PORT=3000
HTTPS=true
SSL_CRT_FILE=certs/localhost.pem
SSL_KEY_FILE=certs/localhost-key.pem
BROWSER=none
WDS_SOCKET_PORT=443
```

## 💡 Dicas

- Use o Firefox no Android para confiar em certificados locais.
- Certifique-se de instalar o certificado `rootCA.pem` no celular.
- Ideal para projetos que usam `connectFirestoreEmulator` e precisam evitar bloqueios de mixed content.

## 🤝 Contribuindo

Pull requests são bem-vindos! Sinta-se à vontade para abrir issues ou sugerir melhorias.

## 📜 Licença

[MIT](./LICENSE)