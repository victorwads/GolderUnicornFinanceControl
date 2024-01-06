# GoldenUnicornFinanceControl - README de Desenvolvimento

## Introdução
Este documento serve como um guia para o desenvolvimento do aplicativo, um aplicativo de controle financeiro pessoal. O objetivo é fornecer uma visão clara das funcionalidades e etapas de desenvolvimento planejadas.

## Estrutura do Repositórios

Este repositório contém diversos subprojetos relacionados ao aplicativo. Cada subprojeto está organizado em seu próprio diretório e configurado como um submódulo Git.

## Subprojetos e Diretórios

### `/`
Aqui estão as configurações e definições de infraestrutura para os serviços Firebase utilizados nos subprojetos.

### `/android`
Este diretório contém o subprojeto Android. Desenvolvido com Kotlin e Android Compose.

### `/ios`
Aqui está o subprojeto iOS, construído com Swift e SwiftUI.

### `/web`
Este diretório é dedicado ao subprojeto Web, desenvolvido com React e Deno.

### `/backend`
Contém todas as funções e configurações do backend, potencialmente usando Firebase Cloud Functions.

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
- Desenvolvimento da lógica para criação e armazenamento seguro da senha de criptografia.
- Implementação da criptografia de dados no front-end.
- Desenvolvimento de lógicas de criptografia e descriptografia.

### Etapa 6: Testes e Qualidade
- Implementação de testes unitários e de integração.
- Testes de usabilidade e experiência do usuário.

### Etapa 7: Maior Etapa
- Planejamento e implementação de novas funcionalidades com base no feedback.
- Melhorias contínuas e atualizações de manutenção.

#### Features Planejadas:

- Dash Board
    - Cards com informações mais importantes para o usuário
- Contas
    - Registros
    - Despesas Fixas
    - Despesas Periodicas
    - Link Valor de Faturas Pagas e Futuras
    - Saldo Atual Baseados em Registros Efetivados
    - Saldo Previsto Baseado em Registros Futuros
    - Soma de Itens
    - Categorização
    - Visão Somente Efetivadas, Somente Previstas e Tudo.
    - Filtro
        - Filtros Salvos
        - Filtro Default
- Categorias
    - Cadastro e Edição de Categorias e SubCategorias
    - Transferencias de Categorias (Pago)
- Cartões
    - Cadastro de Cartões
    - Fatura
    - Categorização
    - Limite Disponível
    - Despesas Fixas / Previsões
- Investimentos
    - Como sub-contas
- Transações
    - Transferencias entre contas.
    - Lista de Transferencias
    - Transferencia Futura.
- Objetivos
    - Cadastro de Objetivo
    - Vincular a Uma Conta/Saldo
- Facilidades
    - Importar e Exportar Dados
    - Calculadora no campos de valores
    - Adição Rápida (Templates de Gastos comums e repetivos como Uber, Onibus, Comidas etc..)
      Essa vale descrição: a Adição rapida é uma feature para evitar selecionar informações obvias como Nome, Categoria, Qual conta ou cartão para gastos repetitivos. Dessa forma, rapidamente pode se por somente o valor.
- App Wearable
    - Adições Rapidas
    - Saldos
    - Limites

### Etapa 8: Preparação para o Lançamento
- Revisão final e otimização de desempenho.
- Estratégia de lançamento e marketing.

### Etapa 9: Lançamento e Feedback
- Lançamento do MVP.
- Coleta e análise de feedback dos usuários.

## Contribuições
- Instruções para contribuições externas (se aplicável).

## Licença
- Detalhes da licença do projeto.
