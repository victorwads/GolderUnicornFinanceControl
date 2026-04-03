# Web Legacy Removal Plan

## Objetivo

Documentar o plano para remover a camada legada do `Web/` que ainda vive fora de `src/visual`, preservando apenas a infraestrutura estrutural que continuar necessária.

Este documento existe para orientar a fase em que a aplicação Web deixará de depender de:

- layouts legados
- telas legadas
- rotas legadas
- formulários legados
- componentes visuais legados
- providers/utilitários legados que já possuem equivalente na camada visual

## Princípio

A direção desejada é:

- a UI final deve viver em `Web/src/visual`
- rotas, pages e layouts devem renderizar a camada visual
- a camada legada deve deixar de ser usada progressivamente até ser removida

Exceção explícita:

- `Web/src/components/conteiners`

Os containers continuam como infraestrutura estrutural do app e não entram no escopo de remoção imediata só por não estarem em `src/visual`.

## Estado Atual

Hoje existem duas camadas convivendo:

1. camada visual nova em `Web/src/visual`
2. camada legada em `Web/src/components`, `Web/src/features`, parte de `Web/src/pages` e integrações associadas

O alias `@componentsDeprecated` ainda aponta para `Web/src/components`.
O alias `@containers` foi criado para isolar o pacote de containers sem manter dependência nominal de `@componentsDeprecated/conteiners`.

Conclusão prática:

- `@containers` deve permanecer
- `@componentsDeprecated` deve desaparecer no futuro
- ainda existem muitos fluxos reais consumindo componentes legados

## O que Deve Permanecer

Itens que podem continuar existindo mesmo depois da limpeza visual:

- `Web/src/components/conteiners`
- qualquer infraestrutura estrutural que ainda seja necessária para orquestrar a árvore de telas
- integrações de dados, repositórios e modelos que não sejam UI

Observação:

Se no futuro os containers forem movidos para outro namespace mais neutro, isso deve ser uma refatoração separada. O objetivo aqui não é apagar infraestrutura útil, e sim apagar UI legada.

## O que Deve Ser Removido

Tudo que representa UI legada fora de `src/visual` e que existia antes da entrada da camada visual compartilhada.

Isso inclui, quando não houver mais uso:

- componentes básicos legados em `Web/src/components`
- formulários legados
- campos legados
- helpers visuais legados
- telas legadas em `Web/src/features`
- rotas legadas que ainda apontam para telas antigas
- wrappers de página que ainda montam telas legadas
- providers de UI legados que já tiverem substituição na camada visual

## Inventário Atual do Legado Ainda em Uso

### Infra / Providers / Orquestração

Ainda há uso de:

- `@componentsDeprecated/AppUpdatesProvider`
- `@componentsDeprecated/Vars`
- `@componentsDeprecated/WithRepo`
- `@componentsDeprecated/progress/FloatingProgress`

Esses itens hoje sustentam parte do app real e não podem ser removidos sem substituir o comportamento.

### Componentes Visuais Legados

Ainda há uso de:

- `@componentsDeprecated/Button`
- `@componentsDeprecated/common/Button`
- `@componentsDeprecated/Icons`
- `@componentsDeprecated/Loading`
- `@componentsDeprecated/Selector`
- `@componentsDeprecated/GlassContainer`
- `@componentsDeprecated/visual/Card`
- `@componentsDeprecated/visual/Row`
- `@componentsDeprecated/visual/Dialog`

### Campos / Inputs Legados

Ainda há uso de:

- `@componentsDeprecated/fields/Field`
- `@componentsDeprecated/fields/BaseField`
- `@componentsDeprecated/fields/PriceField`
- `@componentsDeprecated/fields/SelectField`
- `@componentsDeprecated/fields/CheckboxField`
- `@componentsDeprecated/fields/SearchBar`
- `@componentsDeprecated/inputs`

### Voz / Assistant Legados

Ainda há uso de:

- `@componentsDeprecated/voice/AIMicrophone`
- `@componentsDeprecated/voice/microfone`
- `@componentsDeprecated/voice/AIMicrophoneOnboarding.model`

## Áreas do Produto Ainda Presas ao Legado

As dependências atuais encontradas no código mostram uso legado em áreas como:

- accounts
- credit cards
- categories
- timeline
- dashboard
- settings
- groceries
- recurrent
- assistant
- security
- subscriptions

Isso significa que o legado não é uma sobra pequena. Ele ainda faz parte do fluxo principal do app.

## Meta Final

Ao fim da migração:

- nenhuma rota principal deve renderizar telas legadas
- nenhum fluxo de criação/edição deve depender de forms legados
- nenhum import de `@componentsDeprecated/...` deve existir
- `Web/src/features` deve conter apenas integração, composição, navegação e domínio que ainda façam sentido
- toda UI de produto deve estar em `Web/src/visual`

## Estratégia Recomendada

### Fase 1: Mapear o que ainda tem uso real

Antes de apagar qualquer arquivo:

- listar todos os imports de `@componentsDeprecated/...`
- agrupar por domínio
- identificar quais rotas/telas ainda usam cada componente
- separar o que é infraestrutura do que é UI

Saída esperada:

- inventário atualizado de dependências
- lista de rotas antigas ainda ativas

### Fase 2: Migrar fluxos principais para a camada visual

A ordem recomendada é:

1. contas
2. cartões
3. categorias
4. timeline
5. settings
6. dashboard
7. assistant
8. groceries
9. recorrentes
10. fluxos secundários

Para cada fluxo:

- garantir que listagem, criação e edição usem componentes de `src/visual`
- validar no protótipo e no app real
- remover uso de forms/inputs/cards legados

### Fase 3: Substituir infraestrutura legada de UI

Depois que os fluxos principais estiverem migrados:

- substituir `Button` legado por componentes visuais modernos
- substituir `Icons` legado quando houver equivalente consolidado
- substituir `Loading` legado por loading visual consistente
- substituir `Selector`, `Dialog`, `Row`, `Card` legados
- revisar `Vars` e `AppUpdatesProvider`
- revisar `WithRepo`

Observação:

`WithRepo`, `Vars` e `AppUpdatesProvider` podem exigir migração mais arquitetural do que visual. Não devem ser apagados antes de existir substituição clara.

### Fase 4: Limpar rotas legadas

Quando uma tela visual nova já cobrir o fluxo:

- remover a rota antiga
- remover wrappers antigos de page/model quando não forem mais necessários
- atualizar a navegação para apontar apenas para o fluxo novo

### Fase 5: Remover o alias `@componentsDeprecated`

Somente quando o código estiver sem usos:

- remover o alias de `Web/configs/aliases.ts`
- remover o alias de `Web/tsconfig.json`
- apagar os arquivos restantes da UI legada

## Critério de Conclusão

O legado visual só pode ser considerado pago quando:

- `rg "@componentsDeprecated/" Web/src` retornar zero ocorrências
- não existir rota principal renderizando tela antiga
- formulários antigos de contas, cartões, categorias e timeline tiverem sido substituídos
- dashboard, settings e assistant não dependerem de componentes visuais legados
- a navegação principal estiver integralmente baseada na camada visual

## Itens que Merecem Atenção Especial

### 1. Timeline

A timeline mistura navegação, filtros, edição lateral e fluxos de criação.
Ela deve ser tratada como fluxo prioritário, porque ainda toca componentes e telas antigas.

### 2. Settings

Settings ainda mistura shell novo com telas e infraestrutura antigas.
Esse domínio costuma parecer simples, mas concentra providers, preferências e integrações transversais.

### 3. Assistant / Voice

Parte relevante do assistente ainda depende de componentes legados de voz.
Essa área deve ser migrada com cuidado, porque impacta diretamente a direção agêntica do produto.

### 4. Infraestruturas não visuais travestidas de componente

Alguns itens no namespace legado não são apenas “componentes visuais”.
Exemplos:

- `WithRepo`
- `Vars`
- `AppUpdatesProvider`
- onboarding de microfone

Esses itens não devem ser removidos como se fossem apenas troca de JSX. Exigem plano de substituição.

## Regra Operacional

Não remover arquivos legados apenas porque “parecem antigos”.
Sempre seguir esta sequência:

1. identificar uso real
2. migrar fluxo
3. validar no navegador
4. remover rota antiga
5. remover componente antigo
6. remover alias apenas no final

## Comando Útil de Acompanhamento

Para acompanhar o quanto ainda falta:

```bash
rg "@componentsDeprecated/" Web/src
```

Para revisar o uso atual dos containers:

```bash
rg "@containers" Web/src
```

## Resultado Esperado

Ao fim desse trabalho, o Web terá:

- uma única camada de UI de produto
- menos duplicação entre legado e visual
- menor custo de manutenção
- menos confusão de alias e namespace
- base mais limpa para continuar a evolução do assistente financeiro agêntico
