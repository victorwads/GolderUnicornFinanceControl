# Como usar a documentação de i18n

Quando um agente ou desenvolvedor precisar alterar traduções, ler primeiro:

1. `GENERAL_I18N_PATTERN.md`
2. Depois um dos prompts abaixo conforme a tarefa:
   - `PROMPT_TRANSLATE_FILE.md`
   - `PROMPT_CREATE_TRANSLATION_KEY.md`
   - `PROMPT_UPDATE_TRANSLATION.md`
   - `PROMPT_ADD_LANG_TO_PROJECT.md`

## Regra de ouro

Neste projeto, o i18n é:

- tipado
- global
- segregado por módulos
- com origem no protótipo compartilhado

Se uma mudança visual nasce no protótipo, o texto dela nasce no i18n do protótipo também.
