# AI Decision Services

Este documento registra uma ideia de estrutura para serviços de IA no `Web/`.
O foco aqui não é definir modelo, provider ou UX detalhada.
O foco é registrar a noção de classes de serviço responsáveis por tomar decisões assistidas por IA em pontos específicos do produto.

## Ideia central

Em vez de cada tela ou fluxo implementar sua própria lógica de IA, o `Web/` pode ter serviços especializados, no mesmo espírito de `Repository`, `Service` e outras classes de aplicação.

Esses serviços receberiam um contexto do domínio e devolveriam uma decisão sugerida.

Exemplos de decisão:

- sugerir categoria para um registro
- sugerir ícone para uma categoria
- validar se uma categoria importada faz sentido
- sugerir ajustes ou normalizações em dados importados

## Exemplos concretos

### 1. Categorização de registro

Ao criar um registro, o usuário informa:

- nome
- valor
- talvez conta, cartão, data e outros sinais

Um serviço poderia receber esses dados e responder com:

- categoria sugerida
- confiança
- possíveis alternativas

Exemplo de uso:

- usuário digita `iFood` e `-42,90`
- o serviço sugere `Alimentação`

### 2. Ícone para categoria

Ao criar uma categoria nova, ou ao importar categorias de outro sistema, pode existir nome sem ícone definido.

Um serviço poderia receber:

- nome da categoria
- descrição opcional
- contexto de uso

E responder com algo como:

- ícone sugerido
- palavra-chave visual
- confiança

Exemplo:

- categoria `Farmácia`
- sugestão de ícone relacionada a saúde, remédio ou cruz médica

### 3. Validação durante importação

Em imports como OFX ou importação de outro sistema, o app pode precisar tomar decisões em lote.

Exemplos:

- uma transação veio com categoria que parece incoerente
- categorias importadas vieram sem ícone
- nomes vieram pouco padronizados

Esses casos podem usar serviços de IA em batch para:

- sugerir categoria mais adequada
- manter categoria existente
- sugerir ícone
- normalizar nomes

## Direção técnica

A ideia principal é que a camada de produto chame classes de serviço de decisão, e não diretamente um modelo específico.

Exemplos de classes:

- `RegistryCategorizationService`
- `CategoryIconSuggestionService`
- `ImportedCategoryValidationService`
- `MerchantNormalizationService`

Essas classes podem internamente usar estratégias diferentes no futuro:

- heurística local
- modelo local
- modelo remoto
- prompt barato
- combinação híbrida

Mas quem consome o serviço não precisa saber disso.

## Benefício dessa abordagem

- evita espalhar lógica de IA pelo app
- mantém pontos de decisão mais organizados
- facilita reaproveitar a mesma inteligência em tela e em batch
- permite trocar a estratégia técnica sem reescrever o fluxo do produto
- deixa mais claro onde capturar feedback e evolução futura

## Cenários de uso importantes

- criação manual de registro
- edição de registro
- criação manual de categoria
- importação de OFX
- importação de dados de outro sistema
- rotinas em batch que precisem enriquecer ou corrigir dados

## Forma de pensar esses serviços

Cada serviço deve responder a uma pergunta de negócio bem definida.

Exemplos:

- `qual categoria faz mais sentido para este registro?`
- `qual ícone faz mais sentido para esta categoria?`
- `essa categoria importada parece correta para este item?`

Essa separação tende a ser melhor do que um serviço genérico demais tentando resolver tudo ao mesmo tempo.

## Observação importante

Este documento não fixa ainda:

- se a decisão será local ou remota
- se haverá modelo treinado, embeddings ou prompt
- como será o feedback loop
- quais serviços serão implementados primeiro

A intenção aqui é apenas registrar a estrutura conceitual:
serviços de IA como classes de decisão reaproveitáveis dentro do produto.

## Relação com outros documentos

- [Web On-Device Category Classifier Plan](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/docs/WebOnDeviceCategoryClassifierPlan.md): aprofunda uma hipótese específica para categorização local
- [Assistant Voice Experience](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/docs/ai/AssistantVoiceExperience.md): cobre a experiência de voz e assistente, não esses serviços de decisão
