# Prompt para criar chaves de tradução

Use quando alguém pedir para criar uma ou mais chaves novas.

## Tarefa

Dado um ou mais caminhos `Lang.*`, criar as chaves faltantes no módulo correto e preencher todos os idiomas com a mesma estrutura tipada.

## Passos

1. Liste todas as chaves pedidas.
2. Encontre o módulo correto em `src/shared/i18n/modules/*`.
3. Atualize o `base.ts` do módulo.
4. Atualize todos os `{lang}.ts` do módulo.
5. Se a chave for de tela visual nova, use `visual`.
6. Se a chave for reaproveitável, mova para `commons`.

## Checklist

- [ ] Toda chave existe no `base.ts`.
- [ ] Toda chave existe em todos os idiomas.
- [ ] A estrutura é idêntica entre os idiomas.
- [ ] Assinaturas de função são idênticas entre os idiomas.
