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
    - Duplicar Transação Debito
    - Duplicar Transação Crédito
- Objetivos
    - Cadastro de Objetivo
    - Vincular a Uma Conta/Saldo
- Facilidades
    - Importar e Exportar Dados
    - Calculadora no campos de valores
    - Adição Rápida (Templates de Gastos comums e repetivos como Uber, Onibus, Comidas etc..)
      Essa vale descrição: a Adição rapida é uma feature para evitar selecionar informações obvias como Nome, Categoria, Qual conta ou cartão para gastos repetitivos. Dessa forma, rapidamente pode se por somente o valor.
    - Modo viagem
- Pessoas e Entidades
    - Cadastro de Pessoas e Entidades
    - Vincular a Entradas e Saidas
    - Relatórios de Entradas e Saidas por Pessoas e Entidades
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

## Estrutura do Repositório

Este repositório funciona na prática como um monorepo leve. Os diretórios principais ficam lado a lado dentro do mesmo repositório Git, mas nem todos possuem o mesmo nível de prioridade atualmente.

### Visão Geral

#### `/Web`
É a versão principal do produto e o foco atual de desenvolvimento. O app Web usa React + Vite + TypeScript e concentra tanto a lógica de finanças quanto a evolução do assistente com IA/voz.

#### `/Web/src/visual`
Esta pasta merece atenção especial: ela espelha a camada visual compartilhada do repositório `vibe-financas-magicas`. O remoto `visual` aponta para `git@github.com:victorwads/vibe-financas-magicas.git`, mas o fluxo operacional atual de sincronização deve usar `shared:export` e `shared:import`.

Na prática isso significa:

- `Web/` não é um submódulo Git
- o repositório raiz rastreia normalmente os arquivos dentro de `Web/`
- a camada visual nova mora em `Web/src/visual`
- parte da base antiga ainda existe em `Web/src/components` e `Web/src/features`, convivendo com a migração para o novo layout

#### `/Site`
Site institucional e assets públicos auxiliares.

#### `/Backend`
Backend enxuto para necessidades específicas do app, incluindo integrações simples e suporte ao ecossistema Firebase.

#### `/Firebase`
Configurações, dados auxiliares e estrutura de suporte ao Firebase.

#### `/Importer`
Ferramentas de importação e processamento de dados financeiros.

#### `/Android` e `/iOS`
Clientes móveis nativos. Existem no repositório, mas hoje não são o foco principal e podem estar parcialmente descontinuados em relação ao Web.

#### `/LanguageConverter`
Ferramentas auxiliares de conversão/manipulação de linguagem usadas no ecossistema do projeto.

### Estado Atual da Arquitetura

O projeto nasceu como um app de controle financeiro pessoal e evoluiu para uma direção de assistente financeiro agêntico. Hoje a principal linha de evolução do produto combina:

- gestão financeira pessoal
- interface Web como plataforma principal
- nova camada visual em `Web/src/visual`
- recursos de IA para voz, navegação, interpretação de intenção e execução assistida de tarefas

### Observações Importantes sobre Git

Apesar de existir uma pasta vazia `Web/.git`, o diretório `Web/` atualmente resolve para o mesmo repositório Git da raiz. Ou seja, o fluxo real de trabalho é o do repositório principal, não de um submódulo independente.

Por isso:

- `git clone --recurse-submodules` não é necessário para o estado atual do projeto
- `git submodule update --remote` não é a estratégia correta para atualizar a camada visual
- o fluxo correto de sincronização visual é via `shared:export` e `shared:import` no repositório `vibe-financas-magicas`
- primeiro altera-se e commita-se em um lado, depois sincroniza-se para o outro lado
- não se deve misturar os dois fluxos no mesmo ciclo de trabalho

## Contribuições
- Instruções para contribuições externas (TODO).

## Licença
- [GNU GENERAL PUBLIC LICENSE, Version 3](./LICENSE)
