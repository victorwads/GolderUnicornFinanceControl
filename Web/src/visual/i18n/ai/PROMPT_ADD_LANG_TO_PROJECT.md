# Prompt para adicionar idioma ao projeto

Use quando for necessário criar um novo idioma.

## Passos

1. Adicione o idioma em `src/shared/i18n/index.tsx`.
2. Crie `src/shared/i18n/translations/{lang}.ts`.
3. Para cada módulo em `src/shared/i18n/modules/*`, crie `{lang}.ts`.
4. Garanta que a estrutura siga exatamente o `base.ts` de cada módulo.
5. Valide que `Langs` expõe:
   - `lang`
   - `name`
   - `short`
   - `locale`

## Checklist

- [ ] Idioma novo presente no provider.
- [ ] Todos os módulos possuem `{lang}.ts`.
- [ ] O build quebra se qualquer chave estiver faltando.
