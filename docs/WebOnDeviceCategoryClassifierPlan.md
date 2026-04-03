# Web On-Device Category Classifier Plan

## Objetivo

Criar um categorizador inteligente de lançamentos financeiros que rode no front-end (`Web/`) de forma assíncrona, sem depender de chamadas de IA por transação no backend.

Direção do projeto:

- classificação automática de categoria ao digitar descrição/título
- baixo custo operacional (zero custo por chamada de API externa)
- aprendizado contínuo com correções do usuário
- persistência local para velocidade + persistência no Firebase para continuidade entre dispositivos

## Escopo Inicial

Entradas para inferência:

- `description` (principal)
- `amount` (sinal + faixa)
- contexto opcional: conta/cartão, tags, data, categoria usada recentemente

Saídas:

- `suggestedCategoryId`
- `confidence` (0 a 1)
- `topCandidates` (ex.: top 3)
- `reasonCodes` (ex.: `semantic_match`, `merchant_rule`, `user_history`)

Fora do escopo da Fase 1:

- fine-tuning de modelo no dispositivo
- LLM generativo para todas as transações

## Termo Importante

O nome do delay que você descreveu é `debounce`.

- `debounce`: espera um intervalo sem nova digitação para disparar a inferência
- objetivo: evitar inferência a cada tecla e reduzir custo de CPU
- valor inicial recomendado: `250ms` a `400ms`

## Cenários Iniciais Obrigatórios

### Cenário A: criação/edição no formulário de transação

Regra de uso:

- ao abrir a tela de criação, tentar sugerir categoria automaticamente
- ao abrir a tela de edição, só sugerir se o registro estiver sem categoria
- durante digitação, recalcular sugestão com `debounce` enquanto o usuário ainda não escolheu categoria manualmente

Comportamento esperado:

1. Se campo `category` estiver vazio, habilitar sugestão automática.
2. Ao mudar `description` (e contexto), chamar `classifyAsync`.
3. Se confiança for suficiente, preencher como sugestão.
4. Se usuário selecionar categoria manualmente, parar auto-preenchimento.
5. Se usuário limpar novamente a categoria, reativar sugestão automática.

Estado mínimo recomendado no formulário:

- `categorySelectionMode: "none" | "suggested" | "manual"`
- `lastSuggestedCategoryId?: string`

Regras:

- modo `manual`: não sobrescrever categoria automaticamente
- modo `suggested`: pode atualizar sugestão conforme novos sinais
- modo `none`: seguir fluxo normal de sugestão

### Cenário B: assistente de não categorizados (um por um)

Fluxo inicial:

- buscar registros sem categoria
- apresentar um item por vez na frente do usuário
- sugerir categoria e pedir ação explícita: confirmar, trocar ou pular
- após ação, avançar para o próximo item

Restrições:

- não processar em background silencioso
- manter o usuário no controle de cada decisão
- registrar feedback para aprendizado incremental

## Modelos e Pacotes NPM

### Recomendado para MVP

- `@huggingface/transformers`
  - inferência de embeddings no browser
  - WebGPU quando disponível, fallback para WASM
- modelo sugerido: `Xenova/multilingual-e5-small`
  - bom equilíbrio de qualidade x tamanho
  - suporte multilíngue para cenário PT-BR

### Alternativa mais leve

- `Xenova/paraphrase-multilingual-MiniLM-L12-v2`
  - também multilíngue
  - útil se o benchmark local mostrar melhor latência/qualidade no device alvo

### Pacotes auxiliares

- `comlink` (opcional): simplifica chamada entre UI e Web Worker
- `idb` ou `dexie` (opcional): IndexedDB com API mais simples para cache local de vetores e metadados

Observação:

- Começar sem `onnxruntime-web` explícito (Transformers.js já abstrai backend de execução).
- Adicionar `onnxruntime-web` manualmente apenas se for necessário controle fino de runtime/performance.

## Arquitetura Proposta

### 1) Pipeline híbrido (recomendado)

1. Regras rápidas (alta precisão):
   - padrões explícitos (`ifood`, `uber`, `salário`, `fatura`, etc.)
   - mapeamentos de merchant conhecido -> categoria
2. Embedding semântico:
   - embedding da transação
   - embedding de perfis de categoria (nome + descrição + exemplos)
   - score por similaridade vetorial
3. Ajuste por contexto:
   - histórico do usuário
   - recorrência por conta/cartão
   - horário/dia (opcional)
4. Decisão por confiança:
   - `confidence >= threshold_auto`: preenche categoria automaticamente
   - `confidence < threshold_auto`: mostra sugestão sem autoaplicar

Por que híbrido:

- evita erros grosseiros
- melhora explainability
- reduz dependência de modelo grande

### 2) Componentes técnicos no Web

- `CategoryClassifierEngine` (domínio):
  - combina regras + similaridade + histórico
- `EmbeddingWorker` (infra):
  - carrega modelo de embedding
  - gera vetores de forma assíncrona
- `CategoryProfileStore` (dados):
  - guarda perfis vetoriais de categoria
  - versiona embeddings por categoria e modelo
- `CategorizationFeedbackStore` (dados):
  - salva correções manuais para aprendizado incremental

### 3) Fluxo assíncrono de UX

1. Usuário digita descrição.
2. UI aciona `classifyAsync(...)` com debounce (ex.: 250 ms).
3. Worker responde com sugestão e confiança.
4. UI atualiza campo de categoria sem bloquear digitação.
5. Ao salvar transação, confirmação/correção alimenta feedback local e remoto.

Para o formulário, cancelar requisição anterior quando houver nova digitação (`requestId` incremental ou `AbortController`) para evitar race condition de sugestões antigas.

## Encaixe no Projeto Atual (`Web/`)

### Pontos de integração imediata

- [AddAccountTransaction.model.tsx](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/pages/accounts/AddAccountTransaction.model.tsx)
- [AddCreditCardTransaction.model.tsx](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/pages/credit-cards/AddCreditCardTransaction.model.tsx)
- [Timeline.model.tsx](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/pages/core/Timeline.model.tsx)
- [categorySelectOptions.ts](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/pages/categories/categorySelectOptions.ts)
- [CategoriesRepository.ts](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/data/repositories/CategoriesRepository.ts)
- [TimelineService.ts](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/data/service/TimelineService.ts)

Esses pontos já têm:

- descrição
- lista de categorias
- submissão final da transação
- listagem de lançamentos para selecionar não categorizados

Logo, são os lugares certos para plugar sugestão automática sem quebrar o fluxo.

### Compatibilidade com a camada visual (`src/visual`)

- manter a decisão de categoria no `*.model.tsx` (camada de orquestração)
- manter `layouts` de `src/visual` apenas recebendo props (`suggestedCategoryId`, `confidence`, `isSuggesting`)
- evitar duplicar lógica em `features` legada e `src/visual`

### Encaixe dos dois cenários

- Cenário A:
  - usar `useCategorySuggestion` dentro dos models de criação/edição
  - observar mudanças de `description`, `amount`, `account/card` com `debounce`
  - respeitar `categorySelectionMode`
- Cenário B:
  - criar rota/tela de revisão assistida de não categorizados (ex.: a partir de Timeline)
  - carregar fila de itens sem `categoryId`
  - aplicar categoria item a item com confirmação do usuário

### Estrutura sugerida de arquivos novos

```text
Web/src/features/categorization/
  domain/
    CategoryClassifierEngine.ts
    CategoryScoring.ts
    types.ts
  infra/
    EmbeddingWorkerClient.ts
    embedding.worker.ts
    EmbeddingModelProvider.ts
  data/
    CategoryProfileLocalStore.ts
    CategorizationFeedbackLocalStore.ts
  hooks/
    useCategorySuggestion.ts
```

## Persistência Local + Firebase

### Local (rápido, obrigatório)

Objetivo:

- inferência imediata
- funcionar mesmo com conexão ruim

Sugestão:

- IndexedDB para:
  - perfis vetoriais por categoria
  - feedback/correções pendentes de sync
  - metadados de versão do modelo e checksum dos perfis

### Firebase (continuidade entre dispositivos)

Objetivo:

- manter aprendizado do usuário entre dispositivos/sessões
- permitir reconstruir cache local após login novo

Sugestão de coleções por usuário:

- `Users/{uid}/CategoryEmbeddings/{docId}`
  - categoria/perfil vetorial e versão
- `Users/{uid}/CategorizationFeedback/{docId}`
  - evento de correção e contexto mínimo

No projeto atual, isso entra via repositório no mesmo padrão:

- adicionar constantes em [Collections.ts](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/data/firebase/Collections.ts)
- criar repositórios novos estendendo `RepositoryWithCrypt`
- registrar no [repositories/index.ts](/Users/DevData/victorwads/GitRepos/Personal/GolderUnicornFinanceControl/Web/src/data/repositories/index.ts)

Notas importantes:

- vetores devem ser armazenados com versionamento (`modelId`, `vectorVersion`, `updatedAt`)
- considerar compressão/quantização no payload salvo remotamente
- por segurança e consistência com o app, manter criptografia via `RepositoryWithCrypt`

## Plano de Implementação

### Fase 0 - Preparação (1-2 dias)

- definir dataset de validação (transações históricas anonimizadas)
- definir métricas:
  - `Top-1 accuracy`
  - `% auto-categorizado com confiança >= limiar`
  - taxa de correção manual após autoaplicação

### Fase 1 - Infra local (2-3 dias)

- adicionar `@huggingface/transformers`
- criar `embedding.worker.ts` e client
- implementar fallback `webgpu -> wasm`
- carregar modelo sob demanda (primeira digitação na tela)

### Fase 2 - Motor de classificação (2-4 dias)

- implementar `CategoryClassifierEngine` híbrido
- gerar perfis de categoria a partir de `CategoriesRepository`
- calcular score combinado:
  - `score = semantic + rules + history`
- definir limiares de confiança
- implementar política "não sobrescrever escolha manual"

### Fase 3 - Integração UI (2-3 dias)

- integrar em `AddAccountTransaction.model.tsx`
- integrar em `AddCreditCardTransaction.model.tsx`
- exibir sugestão + indicador de confiança
- registrar feedback quando usuário altera categoria sugerida
- disparar sugestão inicial ao abrir criação/edição sem categoria
- aplicar `debounce` + cancelamento de inferência anterior

### Fase 4 - Persistência remota (2-3 dias)

- criar modelos/repositórios para embeddings e feedback
- sync assíncrono local -> Firebase
- bootstrap no login: baixar estado e preencher cache local

### Fase 4.5 - Fluxo de não categorizados (2-3 dias)

- criar consulta local de lançamentos sem `categoryId`
- criar tela/fluxo de revisão "um por um"
- permitir ações: confirmar sugestão, escolher outra categoria, pular
- salvar decisões e avançar até finalizar fila

### Fase 5 - Hardening e rollout (2-3 dias)

- feature flag (ex.: `categorizationV1`)
- telemetria básica de qualidade (sem dados sensíveis em texto bruto)
- validação manual em `finance.local.wads.dev`

## Critérios de Pronto (MVP)

- categorização sugerida em < 300 ms após warm-up em desktop comum
- fallback funcionando sem WebGPU
- nenhuma regressão no fluxo de salvar transação
- persistência local ativa
- sync Firebase ativo para feedback e perfis
- taxa de auto-categorização configurável por limiar
- auto-sugestão nunca sobrescreve seleção manual
- fluxo de revisão de não categorizados funciona item a item no foreground

## Exemplo de inicialização (referência)

```ts
import { pipeline } from "@huggingface/transformers";

const hasWebGPU = typeof navigator !== "undefined" && "gpu" in navigator;
const device = hasWebGPU ? "webgpu" : "wasm";
const dtype = hasWebGPU ? "fp16" : "q8";

const extractor = await pipeline(
  "feature-extraction",
  "Xenova/multilingual-e5-small",
  { device, dtype }
);
```

## Riscos e Mitigações

- Download inicial do modelo:
  - mitigar com lazy load + cache + pré-carga opcional pós-login
- Performance em mobile antigo:
  - mitigar com fallback WASM + limite de frequência de inferência + limiar conservador
- Drift de categorias (usuário muda estrutura):
  - invalidar e regenerar perfis ao detectar mudança de categorias
- Confiança falsa alta:
  - exigir margem mínima entre top1 e top2 antes de autoaplicar

## Fontes de referência

- [Transformers.js](https://huggingface.co/docs/transformers.js/index)
- [Transformers.js WebGPU](https://huggingface.co/docs/transformers.js/guides/webgpu)
- [Transformers.js dtypes/quantização](https://huggingface.co/docs/transformers.js/guides/dtypes)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/get-started/with-javascript/web.html)
- [WebGPU support (Can I use)](https://caniuse.com/webgpu)
- [Xenova/multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small)
- [ONNX files - multilingual-e5-small](https://huggingface.co/Xenova/multilingual-e5-small/tree/main/onnx)
- [paraphrase-multilingual-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2)
