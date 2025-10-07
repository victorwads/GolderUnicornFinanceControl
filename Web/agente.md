# GoldenUnicornFinanceControl - Agente de IA (Web)

Este documento serve como guia para agentes de IA que operam exclusivamente na pasta `Web` do projeto GoldenUnicornFinanceControl. Ele detalha padrões, organização, fluxos e integrações essenciais para facilitar o entendimento e automação por outras instâncias de IA, evitando a necessidade de varredura completa dos arquivos.

---

## 1. Estrutura e Padrões do Projeto

- **Framework:** React + Vite
- **Linguagem:** TypeScript
- **Arquitetura:** Modular, orientada a Features
- **Padronização:**
  - Código limpo, não verboso, priorizando concisão e clareza
  - Uso extensivo de aliases (ver `tsconfig.json`)
  - Componentização e reutilização máxima

---

## 2. Organização dos Diretórios

- `src/components/`: Componentes reutilizáveis, incluindo ícones padronizados (`Icons.ts`)
- `src/features/`: Funcionalidades agrupadas por domínio (ex: `assistant`, `accounts`, `groceries`)
- `src/data/models/`: Modelos de dados, incluindo definição de entidades e metadados
- `src/data/repositories/`: Repositórios para acesso e manipulação dos dados, abstraindo Firebase
- `src/data/service/`: Serviços auxiliares
- `src/data/utils/`: Utilitários diversos
- `src/i18n/`: Internacionalização, com arquivos para múltiplos idiomas

---

## 3. Páginas e Rotas

- **Definição centralizada:**
  - As rotas estão em `src/features/routes.tsx` e `src/features/assistant/tools/routesDefinition.ts`
  - Utiliza `react-router-dom` e o padrão `createBrowserRouter`
  - Páginas são agrupadas por Feature e importadas via aliases
  - O componente `withRepos` injeta repositórios nas páginas conforme necessário

---

## 4. Features

- Cada Feature possui sua própria pasta, com componentes, lógica, estilos e testes
- Exemplo: `src/features/assistant/` contém:
  - `AssistantController.ts`: Orquestrador das interações de IA
  - `tools/AssistantTools.ts`: Definição e execução das ferramentas de IA
  - `tools/routesDefinition.ts`: Mapeamento das rotas acessíveis pela IA
  - `components/`: Componentes visuais da feature

---

## 5. Repositórios e GetRepository

- **Padrão de acesso:**
  - Todos os dados são acessados via repositórios definidos em `src/data/repositories/`
  - O método central é `getRepositories` (ver `index.ts`), que retorna um objeto com todos os repositórios disponíveis
  - Cada repositório implementa métodos para CRUD e sincronização com o Firebase
  - O padrão garante que a IA nunca acesse dados diretamente, sempre via repositórios

---

## 6. Firebase

- **Configuração:**
  - Centralizada em `src/data/firebase/google-services.ts`
  - Utiliza Firestore, Auth, Functions e Analytics
  - Suporte a emuladores em ambiente de desenvolvimento
- **Persistência:**
  - Repositórios abstraem toda a lógica de persistência e sincronização

---

## 7. Internacionalização (i18n)

- **Estrutura:**
  - Arquivos de idioma em `src/i18n/` (ex: `ptBR.ts`, `en.ts`)
  - O arquivo `index.ts` gerencia seleção dinâmica de idioma e fallback
  - Todas as strings visíveis ao usuário devem ser internacionalizadas

---

## 8. Padrão de Ícones

- **Arquivo central:** `src/components/Icons.ts`
  - Utiliza FontAwesome (solid, brands, regular)
  - Exporta o componente `Icon` e lista de nomes (`iconNamesList`)
  - Função `getIconByCaseInsensitiveName` para busca flexível
  - Todos os ícones do projeto devem ser referenciados por este arquivo

---

## 9. Features de IA

- **Orquestração:**
  - `AssistantController.ts` define o fluxo de interação, histórico e regras do sistema
  - Ferramentas de IA são definidas em `tools/AssistantTools.ts` e `tools/types.ts`
  - As ferramentas seguem o padrão OpenAI Function Calling
  - O modelo de IA utilizado é configurável (ex: `gpt-4.1-mini`)
  - Todas as ações da IA são registradas e auditáveis
- **Modelos:**
  - Entidade `AiCall` em `src/data/models/AiCall.ts` representa chamadas de IA
  - Uso de metadados e resultados em `metadata/`
  - Custos e uso de tokens monitorados via `ResourcesUseRepositoryShared.ts`

---

## 10. Observabilidade de Telas e Novas Features

- **Padronização:**
  - Novas telas devem ser registradas nas rotas e no mapeamento de ferramentas
  - O arquivo `routesDefinition.ts` deve ser atualizado para que a IA reconheça novas páginas
  - Features e componentes devem ser documentados e internacionalizados

---

## 11. Boas Práticas para Agentes de IA

- Nunca seja verboso: respostas devem ser objetivas e diretas
- Sempre utilize repositórios para acesso a dados
- Siga o padrão de internacionalização
- Utilize ícones apenas via `Icons.ts`
- Atualize mapeamentos de rotas e ferramentas ao adicionar novas telas ou features
- Documente novas entidades e modelos em `models/`

---

## 12. Referências Rápidas

- **Aliases principais:**
  - `@models` → `src/data/models`
  - `@repositories` → `src/data/repositories`
  - `@features` → `src/features`
  - `@components` → `src/components`
  - `@lang` → `src/i18n`
- **Principais arquivos:**
  - Rotas: `src/features/routes.tsx`, `src/features/assistant/tools/routesDefinition.ts`
  - Repositórios: `src/data/repositories/index.ts`
  - Firebase: `src/data/firebase/google-services.ts`
  - Ícones: `src/components/Icons.ts`
  - IA: `src/features/assistant/AssistantController.ts`, `src/features/assistant/tools/AssistantTools.ts`, `src/data/models/AiCall.ts`

## 13. Contribuição Automatica

Agentes de IA podem atualizar este documento quando identificarem melhorias, correções ou novos padrões que facilitem o entendimento do projeto. Mantenha o texto claro, conciso e coerente com os demais itens.
