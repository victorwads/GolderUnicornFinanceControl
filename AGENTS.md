# AGENTS.md

## Objetivo

Este arquivo orienta agentes de IA e colaboradores sobre a estrutura real do repositório `GolderUnicornFinanceControl`, com foco no contexto atual do produto e no fluxo de trabalho mais importante.

## Resumo do Produto

O projeto começou como um app de controle financeiro pessoal. A direção atual do produto é evoluir a experiência para um assistente financeiro agêntico, com IA capaz de:

- interpretar comandos do usuário
- navegar e operar fluxos do app
- apoiar pesquisa e ações dentro da interface
- usar voz como forma principal de interação em partes relevantes da experiência

## Prioridade Atual

A frente principal de desenvolvimento é `Web/`.

Estado atual por área:

- `Web/`: foco principal
- `Backend/`: suporte pontual
- `Site/`: secundário
- `Importer/`: utilitário
- `Android/` e `iOS/`: baixa prioridade no momento

## Estrutura Relevante

### `/Web`

Aplicação principal em React + Vite + TypeScript.

Dentro de `Web/` existem duas camadas convivendo durante a transição visual:

- `src/features`, `src/components` e demais módulos legados
- `src/visual`, que concentra a nova UI e os layouts vindos do trabalho visual externo

### `/Web/src/visual`

Esta pasta representa a cópia integrada da camada visual compartilhada vinda do repositório externo de interface.

Evidências já presentes no histórico:

- remoto `visual`: `git@github.com:victorwads/vibe-financas-magicas.git`
- commit `580942d`: `Squashed 'Web/src/visual/' content from commit ...`
- commit `28aec62`: `Merge commit ... as 'Web/src/visual'`

Conclusão operacional:

- `Web/` não é submódulo
- a integração externa identificada está concentrada em `Web/src/visual`
- mudanças em `Web/src/visual` precisam considerar a origem visual para evitar divergência desnecessária
- a sincronização prática deve acontecer via `shared:export` e `shared:import` a partir do repositório `vibe-financas-magicas`

## Git e Fluxo de Trabalho

Este repositório deve ser tratado como um único repositório Git na prática.

Notas importantes:

- o Git da pasta `Web/` resolve para a raiz do projeto
- o `README.md` antigo falava em submódulos, mas isso não descreve o estado atual
- a pasta `Web/.git` existe, porém o fluxo ativo usa o `.git` da raiz
- a cópia visual em `Web/src/visual` deve ser sincronizada com `prototype_source_code_repo/src/shared`
- o fluxo oficial é:
  alterar e commitar em um lado, sincronizar, revisar, depois commitar no outro
- não misturar edição simultânea e sincronização bidirecional no mesmo ciclo

Ao trabalhar em UI:

- verificar se a mudança pertence à camada nova em `Web/src/visual`
- evitar duplicar componentes entre a camada legada e a camada visual
- documentar quando uma tela foi migrada do legado para a nova estrutura

## Documentação Existente

- `README.md`: visão geral do projeto
- `docs/WebMigrationGuide.md`: guia-base para continuar a migração do Web
- `Web/agente.md`: guia focado apenas na aplicação Web
- `Web/docs/ai/README.AI.md`: notas de produto e ideias para voz/ações de IA

## Expectativa para Agentes

Antes de propor mudanças amplas:

- confirmar se a tarefa é do escopo Web
- identificar se toca a camada legada ou `src/visual`
- considerar o impacto na evolução do assistente agêntico
- seguir `docs/WebMigrationGuide.md` ao migrar telas, rotas e voz
- quando a mudança envolver arquitetura visual compartilhada (`layout`, `page`, `model`, rotas tipadas), considerar `vibe-financas-magicas` como origem da mudança e este repositório como etapa de integração
- preferir atualizar documentação quando a estrutura real divergir do que está escrito

## Validação no Navegador

Toda mudança visual, de rota ou de integração de tela deve ser validada no navegador com a ferramenta de Playwright disponível no ambiente.

URLs padrão de validação:

- protótipo visual: `https://layout.local.wads.dev/`
- app real: `https://finance.local.wads.dev/`

Correspondência exata:

- `https://layout.local.wads.dev/` roda o código do protótipo visual em `prototype_source_code_repo` (symlink para `../vibe-financas-magicas/`)
- `https://finance.local.wads.dev/` roda o código da aplicação real em `Web/`

Uso esperado:

- validar primeiro no `layout.local.wads.dev` quando a mudança pertence ao protótipo visual ou ao contrato compartilhado
- validar no `finance.local.wads.dev` quando a mudança envolve integração real, rotas reais, repositórios, Firebase, i18n real ou comportamento do produto final
- quando uma tela existir nos dois lados, validar nos dois ambientes
- não considerar uma migração concluída sem abrir a tela real no navegador e testar o fluxo principal
