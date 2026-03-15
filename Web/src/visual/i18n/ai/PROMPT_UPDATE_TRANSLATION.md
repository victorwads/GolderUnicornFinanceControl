# Prompt para atualizar valores de tradução

Use quando alguém pedir para mudar o texto de uma chave existente.

## Tarefa

Atualizar o valor sem quebrar o contrato tipado.

## Passos

1. Localize a chave em todos os idiomas do módulo.
2. Verifique se a estrutura continua igual.
3. Atualize todos os idiomas.
4. Preserve assinatura de função e tokens quando existirem.

## Checklist

- [ ] Todos os idiomas foram atualizados.
- [ ] Nenhuma interface foi quebrada.
- [ ] Nenhum componente voltou a usar texto literal.
