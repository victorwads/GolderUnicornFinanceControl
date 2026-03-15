# Padrão Geral de i18n

## Objetivo

Centralizar como o i18n funciona neste projeto para que qualquer agente ou desenvolvedor mantenha o contrato tipado, global e sincronizado entre:

- `prototype_source_code_repo/src/shared`
- `Web/src/visual`
- `Web/src/i18n`

## Estrutura principal

- `src/shared/i18n/base.ts`: interface raiz `FinanceTranslation`.
- `src/shared/i18n/modules/*/base.ts`: contratos por módulo/feature.
- `src/shared/i18n/modules/*/{lang}.ts`: implementação tipada por idioma.
- `src/shared/i18n/translations/{lang}.ts`: composição final por idioma.
- `src/shared/i18n/core/types.ts`: tipos centrais do sistema.
- `src/shared/i18n/core/index.tsx`: utilitários como `withRender`, `loadLanguage` e `deepFreeze`.
- `src/shared/i18n/index.tsx`: provider e bootstrap do `Lang` global.

## Regras fundamentais

- O consumo nas telas é por `Lang.*`, nunca por `t("chave")`.
- Não importar `Lang` em componentes. Usar o global.
- Toda chave nova nasce primeiro no `base.ts` do módulo.
- Toda chave nova precisa existir em todos os idiomas.
- Se o texto for visual e compartilhado, ele pertence ao protótipo em `src/shared/i18n`.
- O `Web` real consome esse contrato; ele não é a origem das frases.

## Divisão por módulos

Hoje o contrato está separado em módulos como:

- `commons`
- `finance`
- `groceries`
- `auth`
- `settings`
- `home`
- `assistant`
- `subscriptions`
- `visual`

`visual` concentra o copy novo das telas visuais compartilhadas quando esse texto não pertence naturalmente ao legado.

## Como componentes consomem

- `Lang.accounts.title`
- `Lang.settings.logout`
- `Lang.visual.home.quickActions`
- `Lang.visual.settings.languageScreen.chooseTitle`

## Convenções

- Preferir reuso em `Lang.commons` antes de criar chave nova.
- Quando a string depende de parâmetros, usar função tipada.
- Quando precisar de render com tokens, usar `withRender`.
- Evitar concatenação manual em tela.
- Evitar locale hardcoded como `'pt-BR'`.
- Evitar moeda hardcoded como `R$`.

## Fluxo correto

1. Alterar i18n no protótipo.
2. Validar o protótipo.
3. Sincronizar `src/shared` para `Web/src/visual`.
4. Validar o app real.

## O que é proibido

- Texto visível hardcoded em `src/shared/layouts`, `src/shared/components`, `src/pages`, `Web/src/visual` e páginas adaptadoras correspondentes.
- Criar nova tela visual sem antes definir o namespace dela no i18n.
- Adicionar idioma novo sem preencher todos os módulos.
