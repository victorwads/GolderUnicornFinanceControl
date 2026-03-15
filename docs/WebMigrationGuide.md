# Web Migration Guide

## Objetivo

Este documento define a base de conhecimento para continuar a migração do app Web sem aumentar a fragmentação entre layout legado, layout novo e fluxos de IA/voz.

O objetivo não é apenas "trocar telas", mas consolidar uma arquitetura única para:

- interface principal do produto
- fluxos financeiros
- assistente agêntico
- experiência por voz/microfone

## Propósito Deste Guia

Este guia não deve ser tratado como fotografia exata do estado atual do repositório.

O estado atual muda rápido e deve ser descoberto no código antes de qualquer decisão.

Este documento existe para registrar:

- como a arquitetura deveria funcionar
- como descobrir o estado atual
- como validar se uma tela está dentro do padrão esperado
- como migrar uma tela do jeito certo
- quais responsabilidades pertencem ao protótipo visual e quais pertencem ao app real

## Modelo Mental do Sistema

### Fonte visual compartilhada

Existe um repositório de protótipo visual, atualmente `vibe-financas-magicas`, usado como fonte da arquitetura visual compartilhada.

Esse protótipo é o lugar onde a UI nasce e evolui com:

- layout
- page
- model
- mocks
- fake implementation
- rotas tipadas do layout

Em termos práticos, ele funciona como "source of truth" da camada visual.

### Symlink local para descoberta

Na raiz deste repositório existe um symlink local:

- `prototype_source_code_repo -> ../vibe-financas-magicas/`

Esse symlink existe para facilitar a navegação e a análise do protótipo visual sem confundir:

- a fonte real do protótipo visual
- com a cópia integrada em `Web/src/visual`

Uso esperado:

- consultar `prototype_source_code_repo` para entender a arquitetura visual de origem
- consultar `Web/src/visual` para entender o que já foi sincronizado para este repositório

Regra prática:

- não assumir que `Web/src/visual` representa automaticamente o estado mais recente do protótipo
- quando houver dúvida sobre o padrão esperado, olhar primeiro `prototype_source_code_repo`

### App real

O app real integra essa camada visual com:

- rotas reais
- dados reais
- repositórios
- Firebase
- i18n real
- assistente
- voz

### Ferramenta de geração visual

O layout visual pode ser evoluído com apoio de uma IA especializada em UI, como o fluxo do Lovable.

Por isso, o contrato arquitetural do protótipo precisa estar explícito e protegido.

Se esse contrato não estiver claro, a IA de UI tende a:

- editar diretamente o layout sem respeitar `page/model`
- acoplar demais o visual à implementação real
- introduzir strings hardcoded
- ignorar a estratégia de rotas tipadas

## Como Descobrir o Estado Atual

Antes de migrar qualquer tela, verificar no código:

### 1. Onde a rota atual entra

- `Web/src/features/routes.tsx`
- `Web/src/pages/*`

### 2. Onde está a implementação visual compartilhada

- `Web/src/visual/layouts/*`
- `Web/src/visual/components/*`

### 3. Onde está a implementação antiga

- `Web/src/features/*`
- `Web/src/components/*`
- imports `@componentsDeprecated/*`

### 4. Se já existe `page/model`

Procurar por:

- `*.page.tsx`
- `*.model.tsx`
- `ViewModel`
- classes `*Route`

### 5. Como a navegação está sendo resolvida

Verificar:

- se o layout expõe classes de rota
- se o model/página integra isso com `react-router-dom`

### 6. Como o i18n está sendo tratado

Verificar:

- se a tela usa strings literais
- se a tela usa `Lang.*`
- se o `model` devolve texto pronto
- se o layout espera labels vindas do `ViewModel`

### 7. Como a tela conversa com o assistente

Verificar:

- se a rota está em `routesDefinition.ts`
- se há dependência de microfone
- se há ações que exigem navegação secundária, filtros ou subrotas

## Ambientes de Validação

Toda migração deve ser validada no navegador usando a tooling de Playwright disponível no ambiente.

Ambientes padrão:

- protótipo visual: `https://layout.local.wads.dev/`
- app real: `https://finance.local.wads.dev/`

Correspondência exata:

- `https://layout.local.wads.dev/` serve o código do protótipo visual em `prototype_source_code_repo`, que aponta para `../vibe-financas-magicas/`
- `https://finance.local.wads.dev/` serve o código da aplicação real em `Web/`

Regra prática:

- usar `layout.local.wads.dev` para validar layout, page/model, mocks, rotas tipadas e comportamento do protótipo visual
- usar `finance.local.wads.dev` para validar integração real com rotas, dados, repositórios, Firebase, i18n e comportamento final do produto
- se a tela existir nos dois lados, validar nos dois
- se a tela só funciona em um ambiente e quebra no outro, a migração não está concluída

O que validar com Playwright:

- carregamento da rota correta
- navegação principal da tela
- ações secundárias relevantes
- estado vazio, loading e estados com dados quando aplicável
- erros de console ou overlays de build
- URLs finais após cliques importantes
## Arquitetura Base

### Camada legada

Principais áreas:

- `Web/src/features`
- `Web/src/components`
- aliases `@componentsDeprecated/*`
- `withRepos` e `WithRepo`
- containers, campos e modais antigos

Responsabilidade atual:

- parte importante das regras de negócio e carregamento de repositórios
- várias telas de CRUD e fluxos financeiros ainda em uso
- microfone e parsing de comandos ainda dependentes dessa camada

### Camada visual compartilhada

Principais áreas:

- `Web/src/visual/layouts`
- `Web/src/visual/components`
- aliases `@layouts/*`, `@components/*`, `@hooks/*`, `@contexts/*`
- `Web/src/pages/*` como ponte entre model/view e rotas

Responsabilidade atual:

- nova identidade visual
- novas páginas de Home, Settings, More, Login, Privacy e partes de Subscriptions
- novo sistema visual com componentes `ui/*`

### Camada de integração

Principais áreas:

- `Web/src/pages`
- `Web/src/features/routes.tsx`
- `Web/src/App.tsx`
- `Web/src/index.tsx`

Responsabilidade atual:

- expor layouts novos via páginas adaptadoras
- manter rotas antigas e novas ativas ao mesmo tempo
- conciliar providers antigos com providers novos

## Problemas Estruturais a Resolver

### 1. Navegação híbrida

`Web/src/features/routes.tsx` mistura páginas novas, telas legadas e aliases antigos.

Consequência:

- difícil saber qual camada deve receber uma mudança
- IA pode navegar para uma rota cujo layout não corresponde ao fluxo esperado

### 2. Bootstrap híbrido

`Web/src/index.tsx` e `Web/src/App.tsx` ainda dependem de providers e utilidades legadas, especialmente:

- `VarsProvider`
- `AppUpdatesProvider`
- `useCssVars`
- `FloatingProgress`

Consequência:

- a nova UI ainda não é a dona completa do estado visual
- partes do tema, densidade e comportamento global continuam acopladas ao legado

### 3. Voz e microfone presos à camada antiga

A peça central de voz continua em:

- `Web/src/components/voice/AIMicrophone.tsx`
- `Web/src/components/voice/AIMicrophoneOnboarding*`
- `Web/src/features/assistant/components/AssistantPage.tsx`

Mesmo quando há layouts novos com `MicButton`, o fluxo real ainda depende do microfone legado.

Consequência:

- a feature de voz pode parecer nova na UI, mas executar com contratos antigos
- onboarding, eventos e processamento ficam difíceis de reutilizar nas telas novas

### 4. Migração parcial e inconsistente

O problema não é apenas existir layout novo.

O problema é quando:

- o protótipo visual não consolidou corretamente `page/model`
- ou a integração no app real pulou etapas do contrato visual
- ou a rota final usa mistura de visual novo com estado legado

Consequência:

- a tela parece migrada, mas na prática ainda não está estável

### 5. Definição de rotas da IA desatualizada

`Web/src/features/assistant/tools/routesDefinition.ts` ainda descreve várias rotas em termos antigos e não cobre toda a estrutura nova.

Consequência:

- a IA navega por uma visão parcial do produto
- novas telas podem existir visualmente sem estarem devidamente expostas ao assistente

## Direção de Migração

### Regra principal

Toda nova mudança deve reduzir a dependência de `@componentsDeprecated` e aproximar a feature de uma rota/página baseada em:

- `src/pages`
- `src/visual/layouts`
- componentes `src/visual/components`

### Regra para novas telas

Ao migrar uma área:

1. criar ou concluir o layout em `src/visual/layouts`
2. criar a página adaptadora em `src/pages`
3. conectar a página à regra de negócio existente
4. trocar a rota principal para a página nova
5. manter a rota antiga apenas se houver necessidade explícita de fallback temporário
6. atualizar `routesDefinition.ts` para a IA conhecer a tela correta

### Regra para voz

Não reimplementar a lógica de voz do zero durante a migração de telas.

Direção recomendada:

- preservar o motor atual de microfone enquanto a UI migra
- isolar melhor o contrato de voz
- fazer a nova UI consumir esse contrato, em vez de importar diretamente blocos legados

## Fluxo de Sincronização Visual

### O que é compartilhado

O compartilhamento com o repositório visual externo está concentrado em:

- `Web/src/visual`

Remoto configurado neste repositório:

- `visual -> git@github.com:victorwads/vibe-financas-magicas.git`

### Regra operacional

Quando a mudança for de componente, layout, view model visual, rota tipada do layout ou infraestrutura compartilhável de UI:

- fazer primeiro no repositório `vibe-financas-magicas`
- depois sincronizar para este repositório via `shared:export`

Quando a mudança for de integração com app real:

- repositórios
- models do domínio
- Firebase
- i18n efetivo do app
- `react-router-dom`
- providers globais
- mapeamento da IA

então a mudança pertence a este repositório principal.

### Fluxo oficial

Do protótipo visual para o app real:

```bash
cd prototype_source_code_repo
npm run shared:export
```

Do app real para o protótipo visual:

```bash
cd prototype_source_code_repo
npm run shared:import
```

### Recomendações práticas

- rodar `git status` antes da sincronização para evitar misturar mudanças não relacionadas
- preferir commits pequenos e focados dentro de `Web/src/visual`
- evitar editar simultaneamente a mesma responsabilidade nos dois repositórios
- escolher um lado como origem da mudança em cada ciclo:
  `prototype_source_code_repo` ou `Web/src/visual`
- commitar primeiro no lado de origem, depois sincronizar para o outro lado
- revisar o diff no destino antes de continuar
- não misturar `shared:export` e `shared:import` no mesmo ciclo sem uma razão explícita

## Padrão de Conversão de Tela

A regra correta de migração tem duas etapas distintas.

### Etapa 1. Padrão nasce no repositório visual

O padrão `page/model` deve nascer primeiro no repositório visual `vibe-financas-magicas`.

Lá é onde a tela deve ser organizada e validada com:

- layout
- page
- model
- rotas tipadas
- mocks e fake implementation
- i18n compatível com o contrato visual esperado

Motivo:

- o repositório visual é a fonte da arquitetura compartilhada
- a IA que opera naquele contexto trabalha melhor sobre o fluxo React local do protótipo
- se o padrão não estiver consolidado lá, a integração neste repositório tende a desrespeitar a arquitetura desejada

### Etapa 2. Integração acontece no repositório principal

Depois de validado no protótipo visual, o padrão é trazido para este repositório via `shared:export` e só então recebe a integração com:

- `react-router-dom`
- repositórios reais
- Firebase
- i18n real do app
- assistente e voz
- navegação final do produto

### O que este repositório deve conter

Neste repositório, o esperado é preservar e integrar o padrão já definido no visual.

Em outras palavras:

- não inventar aqui um `page/model` diferente do que existe no layout compartilhado
- não pular a etapa de validação no protótipo
- não usar o repositório principal como lugar inicial de experimentação da arquitetura visual

Exemplos atuais neste repositório:

- `Home`: `Web/src/pages/core/Home.page.tsx` + `Home.model.tsx`
- `Settings`: `Web/src/pages/settings/Settings.page.tsx` + `Settings.model.tsx`
- `More`: `Web/src/pages/settings/More.page.tsx` + `More.model.tsx`

### Rota tipada do layout

No layout compartilhado, a navegação é descrita com classes como:

- `ToMoreRoute`
- `ToLanguageRoute`
- `ToCreateCreditCardRoute`

Esse padrão permite que o layout declare intenções de navegação sem conhecer `react-router-dom`.

No repositório principal, a integração resolve essas intenções para URLs reais do app.

### Checklist de conversão de uma tela

Ao migrar uma tela para o padrão novo:

1. implementar ou corrigir a arquitetura `page/model` no repositório `vibe-financas-magicas`
2. garantir que o layout exporte um `ViewModel` claro
3. garantir que o layout exporte classes de rota para todas as ações de navegação
4. validar a fake implementation e os mocks no protótipo visual
5. sincronizar `Web/src/visual` via `shared:export`
6. integrar o domínio real neste repositório sem quebrar o contrato do layout
7. conectar a rota real em `Web/src/features/routes.tsx`
8. revisar `Web/src/features/assistant/tools/routesDefinition.ts`
9. validar i18n, navegação, loading, estados vazios e ações secundárias
10. validar se microfone/assistente continuam consistentes no shell e na tela
11. validar com Playwright no `layout.local.wads.dev` e no `finance.local.wads.dev` quando a tela existir nos dois lados

### Checklist específico para telas complexas

Para telas como `Timeline`, além do checklist acima, validar:

- filtros e subrotas
- exportação/importação
- ações de item
- estado de pesquisa
- agrupamento por período
- modo compacto vs expandido
- datas formatadas
- valores monetários
- traduções e labels
- compatibilidade com navegação do assistente

## Observação Importante sobre Timeline

`Timeline` ainda não está no mesmo padrão consolidado esperado para telas como `Home` e `Settings`.

Sinais atuais:

- não existe `Web/src/pages/core/Timeline.page.tsx`
- não existe `Web/src/pages/core/Timeline.model.tsx`
- o layout `Web/src/visual/layouts/core/Timeline.tsx` ainda contém `useState`
- o layout ainda carrega dados mockados e detalhes locais de filtro

Isso indica que a `Timeline` ainda está parcialmente em estágio de protótipo visual e ainda não consolidou corretamente o padrão que deve nascer no repositório de layout.

Antes de promover essa tela para a rota principal, o ideal é:

1. consolidar no repositório visual o `Timeline.page/model` com fake implementation
2. tipar as intenções de navegação e subrotas da tela no próprio layout compartilhado
3. sincronizar `Web/src/visual` via `shared:export`
4. adaptar os filtros, import/export e pesquisa ao domínio real
5. revisar i18n e strings visíveis
6. só então substituir a rota principal antiga

## i18n no Estado Atual

Hoje o i18n não está estruturado de forma plenamente consistente entre legado, visual e integração.

### O que existe

Existe um sistema global em:

- `Web/src/i18n/index.ts`
- `Web/src/i18n/*.ts`

Esse sistema popula globais como:

- `Lang`
- `CurrentLang`
- `CurrentLangInfo`

Na camada legada, isso é usado diretamente em vários lugares com `Lang.*`.

### O problema atual

Na camada visual compartilhada, não há um contrato único de i18n ainda.

Hoje coexistem três estilos:

- strings literais no próprio layout
- uso direto de globais em partes legadas/integradas
- labels e navegação resolvidas parcialmente no model

Isso significa que, hoje, o `model` não é o responsável único por devolver todas as frases traduzidas.

### Regra esperada para novas telas

Ao criar ou migrar uma tela no protótipo visual, validar explicitamente como o i18n será resolvido.

O importante não é escolher agora uma única implementação global neste guia.

O importante é que cada tela deixe claro qual contrato está usando:

- layout com strings totalmente vindas do `ViewModel`
- ou layout com um provider/i18n adapter explícito e reutilizável

O que não deve acontecer:

- misturar strings literais, `Lang.*` e traduções parciais sem critério
- esconder a responsabilidade do i18n em vários níveis ao mesmo tempo
- deixar o layout dependente do i18n global do app real sem explicitar isso

## Ordem Recomendada de Trabalho

### Fase 1. Consolidar documentação e fronteiras

- manter este documento atualizado
- alinhar `AGENTS.md` e `Web/agente.md` com a estrutura real
- marcar claramente quais rotas já são novas e quais ainda são legadas

### Fase 2. Fechar os fluxos base do shell do app

Prioridade:

- navegação principal
- tab bar
- carregamento global
- estados globais visuais
- entrada do microfone no shell principal

Objetivo:

- garantir que o contêiner do app esteja estável antes de migrar todos os CRUDs

### Fase 3. Migrar módulos financeiros centrais

Prioridade sugerida:

1. contas
2. cartões
3. timeline/transações
4. categorias
5. recorrentes
6. groceries

Critério:

- migrar lista + criação/edição + detalhes relacionados da mesma área
- evitar migrar apenas uma tela isolada e deixar o fluxo quebrado

### Fase 4. Consolidar assistente agêntico

- revisar `routesDefinition.ts`
- alinhar descrições de rotas com a IA
- garantir que voz/microfone funcionem nas telas principais já migradas
- documentar claramente quais ações o assistente pode executar com segurança

## Regras para a IA ao continuar a implementação

- considerar `Web/` como frente principal do produto
- tratar `src/visual` como destino da migração, não como camada paralela permanente
- evitar criar novas features em `src/components` ou `src/features` quando a mesma feature já tiver destino em `src/visual`
- evitar duplicar lógica de voz em componentes novos
- atualizar documentação sempre que uma rota principal mudar de camada
- ao tocar navegação, revisar também `routesDefinition.ts`

## Definição de Concluído para uma área migrada

Uma área só deve ser considerada migrada quando:

- a rota principal usa página/layout novo
- o fluxo principal não depende de componentes visuais legados
- a navegação do assistente aponta para a rota correta
- microfone/voz não quebra o fluxo principal da área
- a documentação registra que a área saiu do legado
