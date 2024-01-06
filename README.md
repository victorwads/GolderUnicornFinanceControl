# GoldenUnicornFinanceControl - README de Desenvolvimento

## Introdução
Este documento serve como um guia para o desenvolvimento do aplicativo, um aplicativo de controle financeiro pessoal. O objetivo é fornecer uma visão clara das funcionalidades e etapas de desenvolvimento planejadas.

## Estrutura do Repositórios

Este repositório contém diversos subprojetos relacionados ao aplicativo. Cada subprojeto está organizado em seu próprio diretório e configurado como um submódulo Git.

## Subprojetos e Diretórios

### `/android`
Este diretório contém o subprojeto Android. Desenvolvido com Kotlin e Android Compose.

### `/ios`
Aqui está o subprojeto iOS, construído com Swift e SwiftUI.

### `/web`
Este diretório é dedicado ao subprojeto Web, desenvolvido com React e Deno.

### `/backend`
Contém todas as funções e configurações do backend, potencialmente usando Firebase Cloud Functions.

### `/firebase`
Aqui estão as configurações e definições de infraestrutura para os serviços Firebase utilizados nos subprojetos.

### `/site`
Aqui esta o subprojeto do site institucional e spa buildado.

## Uso de Submódulos Git

Cada um desses diretórios é um submódulo Git. Submódulos permitem que repositórios Git sejam incorporados dentro de um repositório pai como referências. Isso é útil para manter cada parte do projeto isolada e gerenciável, permitindo o desenvolvimento independente em subprojetos.

Quando trabalhar dentro de um submódulo, lembre-se de que ele é um repositório Git independente. Mudanças feitas dentro de um submódulo não afetam o repositório pai até que sejam explicitamente commitadas e atualizadas no repositório pai.

### Como Clonar com Submódulos

Para clonar o repositório principal incluindo todos os submódulos, use o seguinte comando Git:
```
git clone --recurse-submodules [URL do Repositório]
```

### Atualizando Submódulos

Para atualizar os submódulos após mudanças, utilize:

```
git submodule update --remote
```

## Funcionalidades e Etapas de Desenvolvimento

### Etapa 1: Configuração Inicial e Estrutura do Projeto
- Configuração do repositório no GitHub.
- Definição da estrutura de diretórios para os subprojetos (Android, iOS, Web, Backend).
- Configuração inicial dos ambientes de desenvolvimento para cada plataforma.

### Etapa 2: Autenticação e Segurança
- Implementação do login com Google e Apple ID.
- Desenvolvimento da lógica para criação e armazenamento seguro da senha de criptografia.

### Etapa 3: Interface do Usuário e Fluxo de Navegação
- Design e implementação das telas iniciais (Splash, Login, Registro).
- Estruturação dos Termos de Uso e Política de Privacidade.

### Etapa 4: MVP - Funcionalidades Básicas
#### 4.1 Cadastro de Contas Bancárias
- Interface para adição de contas bancárias.
- Lógica para armazenamento e gerenciamento das contas.

#### 4.2 Cadastro de Cartão de Crédito
- Interface para registro de informações do cartão de crédito.
- Integração com a lógica de gerenciamento de contas.

#### 4.3 Cadastro de Despesas
- Interface para registro de despesas.
- Associação de despesas com contas bancárias e cartões de crédito.

### Etapa 5: Criptografia Client-Side
- Implementação da criptografia de dados no front-end.
- Desenvolvimento de lógicas de criptografia e descriptografia.

### Etapa 6: Testes e Qualidade
- Implementação de testes unitários e de integração.
- Testes de usabilidade e experiência do usuário.

### Etapa 7: Preparação para o Lançamento
- Revisão final e otimização de desempenho.
- Estratégia de lançamento e marketing.

### Etapa 8: Lançamento e Feedback
- Lançamento do MVP.
- Coleta e análise de feedback dos usuários.

### Etapa 9: Iterações e Melhorias
- Planejamento e implementação de novas funcionalidades com base no feedback.
- Melhorias contínuas e atualizações de manutenção.

## Contribuições
- Instruções para contribuições externas (se aplicável).

## Licença
- Detalhes da licença do projeto.
