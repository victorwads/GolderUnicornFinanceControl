# Web Mobile Shared Contracts Guide

## Objetivo

Este documento define como preparar a arquitetura atual do `Web/` para uma futura camada `Mobile/` em React Native sem duplicar regras de negócio, sem perder os contratos de navegação e sem acoplar o mobile à implementação visual Web.

Ele complementa o [Web Migration Guide](./WebMigrationGuide.md).

O objetivo aqui não é decidir detalhes de UI nativa agora, mas deixar explícito:

- o que pode ser compartilhado entre Web e Mobile
- o que não deve ser compartilhado
- como extrair contratos hoje embutidos dentro de `src/visual`
- como fazer o TypeScript validar que Web e Mobile continuam compatíveis

## Diagnóstico Atual

Hoje a camada visual nova já está relativamente bem separada entre:

- `layout`
- `page`
- `model`

Isso é um bom ponto de partida.

O problema é que muitos contratos que deveriam ser neutros de plataforma ainda estão declarados dentro dos arquivos de implementação visual Web.

Exemplos concretos:

- `Web/src/visual/layouts/core/Timeline.tsx` exporta `TimelineViewModel` e várias classes de rota junto com JSX e componentes Web
- `Web/src/visual/components/TabBar.tsx` exporta `TabBarRoute` e `TabBarViewModel` junto com implementação de navegação Web
- `Web/src/visual/layouts/core/Home.tsx` exporta `HomeViewModel` junto com a view concreta

Isso funciona para o Web atual, mas cria um problema para Mobile:

- o contrato de tela fica escondido dentro de um arquivo que depende de HTML, CSS, Radix e componentes Web
- o Mobile precisaria importar tipos de arquivos que também carregam implementação Web
- a organização reforça a ideia errada de que `visual` compartilhado significa `JSX` compartilhado

## Tese Arquitetural

Para Web e Mobile coexistirem bem, o compartilhamento mais importante não deve ser o JSX e sim os contratos.

Em termos práticos:

- compartilhar domínio
- compartilhar regras de negócio
- compartilhar rotas tipadas
- compartilhar interfaces de `ViewModel`
- compartilhar adaptadores neutros de apresentação quando possível
- não compartilhar a implementação concreta da view

Isso significa:

- `Web` e `Mobile` podem ter a mesma tela conceitual
- `Web` e `Mobile` podem ter o mesmo `Route`
- `Web` e `Mobile` podem consumir o mesmo `ViewModel`
- `Web` e `Mobile` não devem depender da mesma implementação de `layout`

## O Que Não Compartilhar

Os seguintes itens não devem ser tratados como compartilháveis entre Web e React Native:

- HTML
- CSS
- componentes baseados em DOM
- componentes Radix
- implementações que dependem de `react-router-dom`
- qualquer componente visual cujo contrato esteja acoplado a `className`, `MouseEvent`, `ChangeEvent<HTMLInputElement>`, `HTMLElement`, etc.

Mesmo que existam bibliotecas para aproximar Web e React Native, elas não eliminam a necessidade de uma view nativa própria.

Portanto:

- a pasta visual atual do Web não deve ser reaproveitada como implementação no Mobile
- ela pode, porém, continuar sendo a fonte de contrato e estrutura conceitual durante uma fase de transição

## O Que Compartilhar

Os itens com maior valor de compartilhamento são:

- entidades e tipos de domínio
- cálculos e regras financeiras
- casos de uso
- interfaces de repositório
- contratos de tela
- contratos de navegação
- `ViewModel`s e tipos auxiliares
- enums, discriminated unions e payloads de ações
- helpers de serialização de rota e deep link

## Problema Estrutural Atual

Hoje há vários arquivos em que o contrato e a view concreta moram juntos.

Exemplo de `Timeline`:

- em `Web/src/visual/layouts/core/Timeline.tsx` ficam `TimelineViewModel` e `TimelineRoute`
- em `Web/src/pages/core/Timeline.model.tsx` o model importa esses contratos diretamente de `@layouts/core/Timeline`

Isso cria uma dependência invertida:

- a camada de model depende do arquivo de view
- o contrato nasce dentro do layout em vez de o layout implementar um contrato externo

Esse padrão dificulta a futura adoção de Mobile porque a implementação Web passa a ser dona do contrato compartilhado.

## Diretriz Principal

Todo contrato exportado hoje por um arquivo de implementação visual deve ser extraído para um módulo neutro de plataforma.

Isso vale para:

- interfaces `*ViewModel`
- tipos auxiliares usados por esses `ViewModel`s
- classes ou tipos `*Route`
- payloads de navegação
- labels e contracts de action quando fizerem parte do modelo de tela

## Estrutura Alvo

### Opção recomendada para a fase inicial

Sem introduzir um novo pacote ainda, a extração pode começar dentro do próprio `Web/src/visual`, mas fora dos arquivos de implementação:

- `Web/src/visual/contracts/routes/*`
- `Web/src/visual/contracts/view-models/*`
- `Web/src/visual/contracts/screens/*`

Exemplo:

- `Web/src/visual/contracts/screens/core/timeline.contract.ts`
- `Web/src/visual/contracts/screens/core/home.contract.ts`
- `Web/src/visual/contracts/components/tab-bar.contract.ts`

Nesse estágio:

- o Web continua funcionando
- os contratos deixam de depender do layout
- a futura camada Mobile já pode importar esses arquivos

### Estrutura alvo mais limpa para coexistência Web + Mobile

Quando o `Mobile/` existir, o ideal é promover esses contratos para uma pasta realmente compartilhada no repositório:

- `packages/domain`
- `packages/data`
- `packages/navigation`
- `packages/presentation`
- `Web/`
- `Mobile/`

Onde:

- `packages/domain`: entidades, regras e cálculos
- `packages/data`: interfaces de repositório e adapters por plataforma
- `packages/navigation`: contratos de rota, params, serialização e deep links
- `packages/presentation`: `ViewModel`s, contratos de tela, tipos de item de lista, estados de loading, eventos de UI abstratos

## Regra de Ouro

O `layout` não define o contrato.

O `layout` implementa o contrato.

## Padrão Recomendado para Cada Tela

Cada tela migrável deve convergir para esta separação:

1. `route`
2. `contract`
3. `model`
4. `page`
5. `layout`

### Exemplo conceitual

Para `Timeline`:

- `timeline.route.ts`
- `timeline.contract.ts`
- `Timeline.model.tsx`
- `Timeline.page.tsx`
- `Web/src/visual/layouts/core/Timeline.tsx`
- `Mobile/src/visual/layouts/core/Timeline.tsx`

Responsabilidades:

- `timeline.route.ts`: rotas tipadas, params, helpers de deep link e navegação
- `timeline.contract.ts`: `TimelineViewModel`, `TimelineTexts`, tipos de item, unions e payloads
- `Timeline.model.tsx`: implementação Web do model, adaptando router, repositories e services reais
- `Timeline.page.tsx`: cola entre model e layout
- `layouts/.../Timeline.tsx`: renderização concreta por plataforma

## Sobre a Pasta `visual`

Existem duas interpretações possíveis de `visual`.

### Interpretação errada

`visual` é a implementação concreta da UI de uma plataforma.

Se esse for o entendimento, ela não é compartilhável entre Web e Mobile.

### Interpretação correta para a migração

`visual` representa a arquitetura de tela e seus contratos de apresentação.

Nessa leitura:

- parte de `visual` pode ser compartilhada
- parte de `visual` deve ser especializada por plataforma

Portanto, a decisão recomendada é:

- manter o nome e a estrutura mental das telas
- externalizar contratos para módulos neutros
- deixar os layouts concretos por plataforma separados

## Contratos de Navegação

Os contratos de rota devem deixar de nascer dentro dos arquivos JSX.

Eles devem ser centralizados em módulos reutilizáveis e tipados.

Esses contratos precisam cobrir:

- screen id
- parâmetros obrigatórios e opcionais
- tipos de navegação interna
- helpers para URL Web
- helpers para deep link Mobile

Objetivo:

- a mesma tela conceitual gera a URL do Web
- a mesma tela conceitual gera o deep link do Mobile
- o assistente usa a mesma ontologia de telas

Exemplo:

- Web: `/creditcards/:id/invoices/:yearMonth`
- Mobile: `goldenunicorn://creditcards/:id/invoices/:yearMonth`

Ambos devem ser derivados do mesmo contrato, não de implementações paralelas.

## Contratos de ViewModel

Os `ViewModel`s devem ser tratados como API pública de tela.

Isso implica:

- não depender de tipos DOM
- não depender de componentes Web
- não expor detalhes de framework de roteamento
- preferir payloads explícitos a callbacks acoplados a eventos do DOM

### Exemplo de direção correta

Preferir:

- `setSearchText(value: string): void`
- `navigate(route: TimelineRoute): void`

Evitar:

- `onSearchChange(event: ChangeEvent<HTMLInputElement>): void`
- `navigate(path: string): void` quando a tela já possui contrato tipado de rota

## Regras para Tipos Compartilhados

Todo tipo compartilhado deve obedecer às regras abaixo:

1. Não importar de `@components/*`, `@layouts/*` ou arquivos de view concreta.
2. Não importar de libs Web-only.
3. Não importar de libs Native-only.
4. Não depender de DOM, Browser APIs ou classes nativas.
5. Ser validável isoladamente por TypeScript.

## Estratégia Incremental

Não é necessário reorganizar todo o projeto antes da primeira tela mobile.

### Fase 1

- identificar telas em `src/visual/layouts/*` que exportam contrato e layout no mesmo arquivo
- extrair `Route` e `ViewModel` para arquivos `*.contract.ts` e `*.route.ts`
- ajustar `pages/*.model.tsx` para importar dos contratos externos em vez de importar do layout

### Fase 2

- consolidar helpers de deep link e serialização de params
- padronizar a forma como `page/model` recebem o contrato da tela
- eliminar imports reversos onde o model depende do layout

### Fase 3

- mover contratos maduros para uma pasta compartilhada de verdade
- iniciar `Mobile/` usando os mesmos contratos
- implementar apenas layouts nativos e adapters de plataforma

### Fase 4

- adicionar validação de build cruzada entre Web e Mobile
- impedir regressões de contrato no CI

## Estratégia de TypeScript

Se o objetivo é que uma mudança no Web possa acusar quebra futura no Mobile, o TypeScript precisa tratar os contratos compartilhados como fronteira formal.

### Recomendação

Usar `tsconfig` com project references ou checagens separadas por escopo:

- `tsconfig.shared.json`
- `Web/tsconfig.json`
- `Mobile/tsconfig.json`

Com isso:

- o contrato compartilhado é compilado isoladamente
- Web compila contra o contrato
- Mobile compila contra o mesmo contrato
- qualquer quebra em um tipo compartilhado falha no build antes da integração manual

### Regra prática

Nenhum tipo que o Mobile consuma deve existir apenas como efeito colateral de um arquivo Web.

Ele deve ter um módulo próprio e estável.

## Estratégia de Build e CI

Quando a base Mobile existir, o CI deve validar no mínimo:

1. `typecheck` dos contratos compartilhados
2. `typecheck` do Web
3. `typecheck` do Mobile
4. build do Web
5. validação mínima do Mobile

O importante é que:

- quebrar um contrato falhe cedo
- a compatibilidade seja responsabilidade do compilador, não só de revisão manual

## Convenções Recomendadas

### Convenção de nomes

- `*.route.ts`
- `*.contract.ts`
- `*.model.tsx`
- `*.page.tsx`

### Convenção de imports

O model não deve importar tipos do layout.

O correto é:

- model importa contrato
- page importa model e layout
- layout importa contrato

### Convenção de pastas

Tela:

- `contracts/screens/<dominio>/<screen>.route.ts`
- `contracts/screens/<dominio>/<screen>.contract.ts`

Implementação Web:

- `pages/<dominio>/<Screen>.model.tsx`
- `pages/<dominio>/<Screen>.page.tsx`
- `visual/layouts/<dominio>/<Screen>.tsx`

Implementação Mobile futura:

- `Mobile/src/pages/<dominio>/<Screen>.model.tsx`
- `Mobile/src/pages/<dominio>/<Screen>.page.tsx`
- `Mobile/src/visual/layouts/<dominio>/<Screen>.tsx`

## Exemplo de Migração da Timeline

### Estado atual

- `TimelineViewModel` e `TimelineRoute` estão dentro de `Web/src/visual/layouts/core/Timeline.tsx`
- `Web/src/pages/core/Timeline.model.tsx` importa esses tipos do layout Web

### Estado desejado

- `timeline.contract.ts` exporta `TimelineViewModel`, `TimelineTexts`, `TimelineData`, `Transaction`
- `timeline.route.ts` exporta `TimelineRoute` e subclasses
- `Timeline.tsx` importa o contrato e apenas renderiza
- `Timeline.model.tsx` importa o contrato neutro

### Benefício

- o layout Web deixa de ser dono do contrato
- o Mobile pode implementar seu próprio `Timeline.tsx`
- o TypeScript passa a validar compatibilidade de forma explícita

## Decisão Operacional Recomendada

Antes de criar `Mobile/`, o repositório deve adotar a seguinte regra:

Toda tela nova ou tela migrada em `src/visual` deve externalizar seus contratos.

Isso evita repetir a correção depois em dezenas de arquivos.

## Relação com o Guia de Migração Web

O [Web Migration Guide](./WebMigrationGuide.md) continua sendo o documento-base de separação entre layout, page e model.

Este documento adiciona a próxima camada de exigência:

- separar não só `view` e `model`
- separar também `implementação visual` e `contrato compartilhado`

## Checklist de Revisão para Telas Novas ou Migradas

- a tela exporta `ViewModel` dentro do layout?
- a tela exporta `Route` dentro do layout?
- o model importa algo de `@layouts/*` além do componente visual?
- existe contrato em módulo neutro?
- a navegação está tipada fora do JSX?
- os tipos são livres de dependência Web-only?
- o Mobile conseguiria consumir esse contrato sem importar DOM, CSS ou Radix?

Se a resposta final for “não”, a migração ainda não está pronta para coexistência Web + Mobile.
