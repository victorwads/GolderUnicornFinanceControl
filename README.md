# GoldenUnicornFinanceControl - README de Desenvolvimento

## Introdução
Este documento serve como um guia para o desenvolvimento do aplicativo, um aplicativo de controle financeiro pessoal. O objetivo é fornecer uma visão clara das funcionalidades e etapas de desenvolvimento planejadas.

A Motivação para desenvolvimento é para uso pessoal e organização das finanças. até hoje já testei vários apps, e somente 1 se aproximou do que eu queria, porem, o app é bem ruim e há MUITA perca de dados. Eu como cliente pagamente já me estressei demais, e decidi fazer meu próprio, como muitos mais recursos e open source para que os usuários possam contribuir com a melhoria do App.

O Principal desafio é fazer com que num projeto OpenSource e de baixo custo de infra, os dados dos clientes sejam privados e compartilhados somente com quem eles querem.

## Published Links (Alpha Version)

- [Play Store - Only Internal Testing](https://play.google.com/store/apps/details?id=br.com.victorwads.goldenunicorn)
- [App Store - Only TestFlight](https://apps.apple.com/br/app/id6475685779)
- [Web App](https://goldenunicornfc.firebaseapp.com/)

### Features Planejadas:

- Criação da Conta
    - Warning de criação de nova conta para caso o usuário já tenha uma conta (* prioritário com Apple Id)
    - OnBoarding
- Dash Board
    - Cards com informações mais importantes para o usuário
    - Cards de Saldos por filtro
- Contas Bancarias
    - Registros
    - Despesas Fixas
    - Despesas Periodicas
    - Link Valor de Faturas Pagas e Futuras
    - Saldo Atual Baseados em Registros Efetivados
    - Saldo Previsto Baseado em Registros Futuros
        - No Fim de um Mês
        - Data Especifica
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
    - Modo viagem
- Configurações
    - Dashboard
        - Mês financeiro
- App Wearable
    - Adições Rapidas
    - Saldos
    - Limites
- Compartilhamento de contas
    - Compartilhar conta/semente com outro usuário.
- Criptografia Client Side de alguns dados [(Detalhamento)](./docs/PrivacyEncrypt.md)

O [Plano base para Desenvolvimento](./docs/DevelopmentPlan.md) das features detalha um pouco sobre a organização para desenvolve-las

## Estrutura do Repositórios

Este repositório contém diversos subprojetos relacionados ao aplicativo. Cada subprojeto está organizado em seu próprio diretório e configurado como um submódulo Git.

### Subprojetos e Diretórios

#### `/`
Aqui estão as configurações e definições de infraestrutura para os serviços Firebase utilizados nos subprojetos.

#### `/android`
Este diretório contém o subprojeto Android. Desenvolvido com Kotlin e Android Compose.

#### `/ios`
Aqui está o subprojeto iOS, construído com Swift e SwiftUI.

#### `/web`
Este diretório é dedicado ao subprojeto Web, desenvolvido com React e Deno.

#### `/backend`
Contém todas as funções e configurações do backend, potencialmente usando Firebase Cloud Functions.

#### `/site`
Aqui esta o subprojeto do site institucional e spa buildado.

### Uso de Submódulos Git

Cada um desses diretórios é um submódulo Git. Submódulos permitem que repositórios Git sejam incorporados dentro de um repositório pai como referências. Isso é útil para manter cada parte do projeto isolada e gerenciável, permitindo o desenvolvimento independente em subprojetos.

Quando trabalhar dentro de um submódulo, lembre-se de que ele é um repositório Git independente. Mudanças feitas dentro de um submódulo não afetam o repositório pai até que sejam explicitamente commitadas e atualizadas no repositório pai.

#### Como Clonar com Submódulos

Para clonar o repositório principal incluindo todos os submódulos, use o seguinte comando Git:
```
git clone --recurse-submodules [URL do Repositório]
```

#### Atualizando Submódulos

Para atualizar os submódulos após mudanças, utilize:

```
git submodule update --remote
```

## Contribuições
- Instruções para contribuições externas (TODO).

## Licença
- [GNU GENERAL PUBLIC LICENSE, Version 3](./LICENSE)