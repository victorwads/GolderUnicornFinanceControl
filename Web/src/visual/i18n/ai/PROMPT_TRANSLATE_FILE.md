# Prompt para traduzir um arquivo

Use este prompt quando um arquivo TS/TSX ainda tiver frases literais.

## Tarefa

Receba um arquivo do projeto e mova todo texto visível ao usuário para o sistema de i18n tipado, substituindo o literal por `Lang.*`.

## Passos

1. Identifique o domínio do arquivo.
2. Descubra o módulo correto:
   - termos reaproveitáveis: `commons`
   - contas/timeline/cartões/categorias: `finance`
   - telas novas compartilhadas: `visual`
   - configurações: `settings`
   - onboarding e assistente visual: geralmente `visual`
3. Adicione a chave ao `modules/<modulo>/base.ts`.
4. Preencha a chave em todos os arquivos `{lang}.ts` do módulo.
5. Substitua o literal no componente por `Lang.<namespace>`.
6. Se houver interpolação, transforme em função tipada.
7. Se houver locale fixo, substituir por `CurrentLangInfo.short` ou helper equivalente.

## Checklist

- [ ] Não sobrou frase literal visível no arquivo.
- [ ] A chave nova existe no `base.ts` correto.
- [ ] Todos os idiomas receberam a mesma estrutura.
- [ ] O componente usa `Lang.*`.
- [ ] Não foi introduzido `t("...")`.
