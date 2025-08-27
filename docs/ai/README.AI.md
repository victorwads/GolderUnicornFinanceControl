# Voice Ideas for GoldenUnicorn

This document collects discovery notes on how voice commands and the `AIActionsParser`
model can assist the main flows of the app.  Each idea maps what a user might say to the
JSON action expected from the parser.  The goal is to explore possibilities rather than
teach implementation details.

## Global navigation
Commands may request a change of screen regardless of the current context.

| Intent | Example commands | Emitted action |
| ------ | ---------------- | -------------- |
| Navigate to screen | pt: "Ir para registros da conta Inter, mês passado"<br/>en: "Go to registry list for Inter, last month"<br/>es: "Ir a los registros de la cuenta Inter, mes pasado" | `{ "action": "navigate.to", "screen": "accounts/registry/list", "params": { "accountName": "Inter", "period": "lastMonth" } }` |

## Accounts – registry listing
Listing allows filtering, sorting and scoping of registries.

| Intent | Example commands | Emitted action |
| ------ | ---------------- | -------------- |
| Update filter | pt: "Filtra pela conta Nubank, mês atual, só despesas"<br/>en: "Show only income for savings account, last 7 days"<br/>es: "Muestra solo gastos de la cuenta caja de ahorro, últimos 7 días" | `{ "action": "filter.update", "accountName": "Nubank", "period": "currentMonth", "type": "expense" }` |
| Apply saved filter | pt: "Aplicar filtro viagens"<br/>en: "Apply saved filter travel"<br/>es: "Aplicar filtro viajes" | `{ "action": "filter.applySaved", "name": "viagens" }` |
| Clear filters | pt: "Limpar filtros"<br/>en: "Clear filters"<br/>es: "Limpiar filtros" | `{ "action": "filter.clear" }` |
| Sort list | pt: "Ordenar por valor"<br/>en: "Sort by value"<br/>es: "Ordenar por valor" | `{ "action": "sort.set", "field": "value" }` |
| Change period | pt: "Mostrar mês passado"<br/>en: "Show last month"<br/>es: "Mostrar mes pasado" | `{ "action": "period.set", "period": "lastMonth" }` |
| Change account | pt: "Conta Inter"<br/>en: "Use Inter account"<br/>es: "Usar cuenta Inter" | `{ "action": "account.set", "accountName": "Inter" }` |
| Search | pt: "Buscar mercado"<br/>en: "Search market"<br/>es: "Buscar mercado" | `{ "action": "search.set", "text": "mercado" }` |

## Accounts – registry form
Voice input fills or updates fields but never saves automatically.

| Intent | Example commands | Emitted action |
| ------ | ---------------- | -------------- |
| Update fields | pt: "Gastei 25 reais no mercado hoje; marca como pago."<br/>en: "Add expense 12.50 for bakery today; not paid."<br/>es: "Gasto de 40 en supermercado ayer; categoría alimentos." | `{ "action": "update", "description": "mercado", "value": -25, "date": "2025-08-15", "paid": true, "categoryName": "mercado" }` |

The user may issue multiple updates in sequence, for example:

* "Na verdade 60" → updates only `value` to `-60`.
* "Troca para conta Nubank" → updates `accountName`.
* "Categoria transporte" → updates `categoryName`.

## Groceries (beta)
The beta grocery list keeps the same actions already available:

| Intent | Example commands | Emitted action |
| ------ | ---------------- | -------------- |
| Add item | en: "I've bought 2 packs of rice" | `{ "action": "add", "id": "random", "name": "rice", "quantity": 2 }` |
| Update item | es: "La leche vence viernes" | `{ "action": "update", "id": "leche", "expirationDate": "CALCULATED_DATE" }` |
| Remove item | pt: "Acabou o feijão" | `{ "action": "remove", "id": "feijão" }` |

## Future ideas
* "Mostrar resumo do mês" → build a temporary dashboard with totals.
* "Comparar com mês anterior" → `analysis.compare({ period: 'month', diff: -1 })`.
* "Abrir fatura atual do cartão X" → navigate and focus on the invoice.
* "Exportar CSV desta semana" → trigger export flow.

## Disclaimer
The assistant never saves data automatically.  Every action must be confirmed by the user
(e.g., by clicking the **Salvar** button in forms).

## Good practices
* Normalise dates and currency values locally before sending to the server.
* Keep `temperature` and `top_p` low to reduce hallucinations and cost.
* Use the app's global language – the parser receives `CurrentLangInfo.short`.
* Respect the current screen context when interpreting commands.
* Confirmation is always required before committing changes.
