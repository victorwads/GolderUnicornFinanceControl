# Importer

O diretório `Importer` é responsável por gerenciar a importação de dados financeiros para o sistema **Golder Unicorn Finance Control**. Ele contém scripts e módulos que processam arquivos de entrada, convertem dados para o formato interno e os integram ao banco de dados principal.

## Funcionalidades

- **Leitura de Arquivos**: Suporte para diversos formatos de arquivos, como CSV, Excel e JSON.
- **Validação de Dados**: Verifica a consistência e integridade dos dados antes da importação.
- **Transformação de Dados**: Converte os dados para o formato esperado pelo sistema.
- **Integração**: Insere os dados processados no banco de dados.

## Estrutura do Diretório

- `src/importers/`: Contém os módulos principais de importação, incluindo:
  - `AccountRegistriesImporter.ts`: Importa registros de contas.
  - `AccountsImporter.ts`: Importa informações de contas bancárias.
  - `BanksImporter.ts`: Importa dados de bancos.
  - `CardInvoceImporter.ts`: Importa faturas de cartões de crédito.
  - `CardsImporter.ts`: Importa informações de cartões de crédito.
  - `CardsRegistriesImporter.ts`: Importa registros de despesas de cartões.
  - `CategoriesImporter.ts`: Importa categorias e subcategorias.
  - `Importer.ts`: Classe base abstrata para os importadores.

## Como Usar

1. Coloque os arquivos de entrada no diretório apropriado.
2. Compile os arquivos TypeScript para JavaScript:
   ```bash
   tsc
   ```
3. Execute o script principal:
   ```bash
   node dist/importer.js --file <caminho_do_arquivo>
   ```

## Requisitos

- **Node.js**: Versão 16 ou superior.
- **TypeScript**: Certifique-se de que o TypeScript está instalado globalmente:
  ```bash
  npm install -g typescript
  ```
- **Dependências**: Instale as bibliotecas necessárias executando:
  ```bash
  npm install
  ```

## Exemplos de Uso

### Importação de um Arquivo CSV
Para importar um arquivo CSV chamado `dados_financeiros.csv`, execute:
```bash
node dist/importer.js --file dados_financeiros.csv
```

### Importação de um Arquivo JSON
Para importar um arquivo JSON chamado `dados.json`, use:
```bash
node dist/importer.js --file dados.json
```

### Logs
Os logs do processo de importação serão gerados no diretório `logs/` com informações detalhadas sobre o status da importação.

## Contribuição

Contribuições para melhorar o diretório `Importer` são bem-vindas! Siga estas etapas para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature ou correção de bug:
   ```bash
   git checkout -b minha-feature
   ```
3. Faça suas alterações e adicione os commits.
4. Envie um pull request para revisão.

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.