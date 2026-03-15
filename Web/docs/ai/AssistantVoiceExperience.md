# Assistant Voice Experience

Este documento consolida o comportamento esperado da feature de assistente por voz/agente no `Web/`.
Ele serve como referência viva para produto, frontend e integração, separando:

- o que já existe hoje no código
- o que o protótipo do layout novo comunica de UX
- o que foi definido como requisito de experiência
- o que ainda precisa ser implementado ou refinado

## Fontes usadas nesta versão

Esta versão do documento foi consolidada a partir de duas fontes:

- código integrado neste repositório, principalmente em `Web/src/visual`, `Web/src/components/voice` e `Web/src/features/assistant`
- protótipo visual em `prototype_source_code_repo`, principalmente:
  - `prototype_source_code_repo/src/shared/components/VoiceAssistant.tsx`
  - `prototype_source_code_repo/src/shared/components/AssistantModeContent.tsx`
  - `prototype_source_code_repo/src/shared/components/VoiceSettingsContent.tsx`

Observação:

- o protótipo externo já simula visualmente vários estados finais da conversa
- o microfone real ainda não está implementado ali, mas a UX visual dos estados está mais próxima da intenção final

## Objetivo

Permitir que usuários conversem com o assistente financeiro de formas diferentes, respeitando preferências individuais de interação.

O assistente deve suportar tanto:

- conversa contínua e natural, com mínima fricção
- envio manual estilo mensageria
- modos de fala com maior controle de privacidade

Essa experiência precisa ser altamente configurável nas configurações do app.

## Escopo deste documento

Este documento cobre:

- modos do assistente
- modos do microfone
- estados visuais e operacionais da conversa
- comportamento de auto-envio
- edição manual da transcrição
- respostas do assistente
- pop-ups e feedbacks de execução agêntica
- configurações relacionadas a voz e interação

Este documento não define:

- escolha definitiva de engine de STT
- escolha definitiva de TTS
- detalhes de implementação de Whisper/WebGPU/WebAssembly

Essas decisões são tratadas como evolução técnica futura. A UX deve ficar desacoplada do motor de reconhecimento de fala.

## Premissas de produto

1. Usuários têm preferências muito diferentes para interação por voz.
2. O microfone não deve ter um único comportamento fixo.
3. A UX precisa funcionar mesmo que o STT mude no futuro.
4. O assistente precisa deixar claro quando:
   - está ouvindo
   - está aguardando envio
   - está processando
   - está executando ações
   - está pedindo mais contexto ao usuário
   - terminou de responder e está aguardando a próxima interação
5. A conversa precisa acomodar tanto voz quanto texto editável.

## Estado atual mapeado no código

### 1. Protótipo visual do assistente

Arquivo principal:

- `Web/src/visual/components/VoiceAssistant.tsx`

O protótipo representa a intenção de UX para a conversa e hoje simula:

- início da escuta ao clicar no microfone
- preenchimento progressivo do texto do usuário
- parada manual da escuta
- auto-envio com indicador visual de progresso
- cancelamento do auto-envio quando o usuário edita o texto
- estado de pensamento do assistente
- balões de informação temporários
- balão persistente da resposta do assistente
- CTA implícito para a próxima fala do usuário

### 2. Configurações já expostas no layout novo

Arquivos principais:

- `Web/src/visual/components/AssistantModeContent.tsx`
- `Web/src/visual/components/VoiceSettingsContent.tsx`
- `Web/src/visual/layouts/settings/Settings.tsx`

O layout novo já comunica conceitualmente:

- modo do assistente:
  - `Modo Live`
  - `Modo Manual`
- modo do microfone:
  - `Segurar para falar`
  - `Clique para começar / Clique para parar`
- configurações de voz:
  - ativar voz
  - velocidade da fala
  - selecionar voz
  - testar voz

Observação importante:
Hoje parte dessas configurações no layout novo ainda é conceitual/prototipada e nem sempre está ligada ao comportamento real do assistente.

### 3. Implementação real atual do microfone e assistente

Arquivos principais:

- `Web/src/components/voice/AIMicrophone.tsx`
- `Web/src/components/voice/microfone.ts`
- `Web/src/features/assistant/components/AssistantPage.tsx`
- `Web/src/features/assistant/microphoneAdapter.ts`
- `Web/src/features/assistant/AssistantController.ts`

Hoje o comportamento real já cobre:

- transcrição parcial
- fila de processamento de fala
- envio após pausa na fala
- exibição de toasts de:
  - avisos
  - resposta pendente do usuário
  - infos de tool call
  - texto parcial reconhecido
- execução agêntica por tool calls

O layout visual novo ainda não está completamente plugado nessa implementação real.

## Modos de experiência

### A. Modo do assistente

#### 1. Modo Live

Objetivo:

- privilegiar conversa natural
- reduzir passos manuais
- permitir sensação de fluxo contínuo

Comportamento esperado:

- o usuário ativa o microfone
- fala livremente
- quando o sistema entende que a fala parou, inicia uma janela curta de auto-envio
- se o usuário não interferir, a mensagem é enviada automaticamente
- se o usuário editar a transcrição, o auto-envio é cancelado
- a partir daí o envio passa a depender de ação manual

Perfil ideal:

- usuários que querem conversar com o assistente de forma fluida
- usuários que preferem menos cliques
- usuários como o Vitor, que preferem falar continuamente

#### 2. Modo Manual

Objetivo:

- dar controle explícito sobre quando enviar
- reduzir risco de envios automáticos indesejados
- aumentar previsibilidade

Comportamento esperado:

- o usuário controla início e fim da escuta
- ao terminar a fala, o conteúdo não deve ser enviado sem confirmação explícita
- a transcrição fica disponível para revisão
- o envio acontece somente quando o usuário clicar no botão de enviar

Perfil ideal:

- usuários com preocupação de privacidade
- usuários que querem revisar antes de enviar
- usuários acostumados a fluxo tipo WhatsApp/chat

## Modos do microfone

### 1. Clique para começar / Clique para parar

Objetivo:

- minimizar esforço físico
- favorecer sessões mais longas

Comportamento esperado:

- primeiro clique: começa a ouvir
- segundo clique: para de ouvir
- depois da parada:
  - em `Modo Live`, pode iniciar auto-envio
  - em `Modo Manual`, aguarda envio explícito

### 2. Segurar para falar

Objetivo:

- maximizar controle momentâneo
- reduzir captação acidental

Comportamento esperado:

- enquanto o botão estiver pressionado, o microfone escuta
- ao soltar, a escuta termina
- depois de soltar:
  - em `Modo Live`, pode entrar na janela de auto-envio
  - em `Modo Manual`, aguarda envio manual

Perfil ideal:

- uso rápido
- ambientes barulhentos
- usuários que querem delimitar com precisão o trecho capturado

## Combinação dos modos

Os modos do assistente e do microfone são eixos independentes.

Combinações suportadas:

1. `Live + Clique`
2. `Live + Segurar`
3. `Manual + Clique`
4. `Manual + Segurar`

### Matriz de comportamento

#### Live + Clique

- clique para começar a ouvir
- clique para parar
- ao parar, inicia janela de auto-envio
- editar texto cancela auto-envio

#### Live + Segurar

- segura para falar
- solta para parar
- ao soltar, inicia janela de auto-envio
- editar texto cancela auto-envio

#### Manual + Clique

- clique para começar
- clique para parar
- sem auto-envio
- usuário revisa e envia manualmente

#### Manual + Segurar

- segura para falar
- solta para parar
- sem auto-envio
- usuário revisa e envia manualmente

## Fluxo principal do protótipo do layout novo

Baseado em `Web/src/visual/components/VoiceAssistant.tsx` e no comportamento desejado:

1. usuário clica no microfone
2. sistema entra em estado de escuta
3. UI indica claramente que está ouvindo
   - texto tipo `você falando...`
   - microfone pulsando/piscando
4. texto reconhecido aparece na área editável do usuário
5. usuário pode:
   - continuar falando
   - parar a escuta
   - encerrar completamente o assistente
6. ao parar de falar:
   - em `Live`, o botão de enviar começa a preencher visualmente
   - se não houver interferência, a mensagem é enviada automaticamente
7. se o usuário tocar/clicar na caixa de texto e editar:
   - o auto-envio é interrompido
   - o envio passa a ser manual
8. ao enviar:
   - o sistema mostra estado de processamento
   - exibe feedbacks de execução agêntica
9. assistente responde:
   - resposta principal fica visível em box persistente
   - UI comunica que é a vez do usuário continuar

## Estados canônicos da conversa

Estados identificados no protótipo:

- `idle`
- `listening`
- `paused`
- `sending`
- `thinking`
- `responded`

### Definição dos estados

#### `idle`

- nenhum turno em andamento
- microfone disponível para iniciar
- assistant overlay pode estar invisível

#### `listening`

- microfone ativo
- usuário falando
- transcrição parcial em andamento
- microfone com forte feedback visual

#### `paused`

- escuta interrompida
- transcrição disponível para revisão
- pode haver:
  - auto-envio em progresso
  - espera por clique manual de envio

#### `sending`

- mensagem está sendo confirmada/enviada
- botão de envio pode mostrar preenchimento completo

#### `thinking`

- assistente está processando
- pode haver pop-ups sobre o que está fazendo
- resposta principal pode exibir placeholder tipo `hmm...`

#### `responded`

- assistente terminou o turno atual
- resposta principal está exibida
- usuário pode retomar por voz ou texto

## Regras de auto-envio

O auto-envio é uma peça central da experiência `Live`.

### Regra principal

Se o usuário para de falar e não faz nenhuma intervenção manual, a mensagem deve ser enviada automaticamente após uma janela curta e visível.

### Requisitos de UX

- o usuário precisa perceber que o envio automático vai acontecer
- o tempo restante deve ser comunicado visualmente
- o usuário deve ter uma forma clara de interromper esse envio

### Cancelamento do auto-envio

O auto-envio deve ser cancelado quando o usuário:

- clicar na caixa de texto reconhecido
- começar a editar o texto
- limpar o texto
- retomar a fala
- cancelar explicitamente

### Configurabilidade futura recomendada

As seguintes preferências podem virar configuração:

- ativar/desativar auto-envio
- tempo de espera antes do auto-envio
- auto-envio só após stop manual ou também após silêncio detectado

## Edição da transcrição

A transcrição não deve ser tratada como saída imutável.

### Requisitos

- texto reconhecido deve ser editável
- edição manual transforma o fluxo em interação revisada
- ao editar, o sistema deve assumir intenção de controle manual

### Regra operacional

Se o usuário tocou na transcrição para corrigir algo, o sistema não deve tomar a liberdade de enviar automaticamente aquele conteúdo.

## Feedbacks visuais da execução agêntica

O assistente não deve parecer uma caixa-preta. Ele precisa comunicar o que está fazendo.

### Tipos de feedback já visíveis no código/protótipo

#### 1. Pop-ups de informação

No protótipo:

- balões temporários de `info`
- exemplos atuais:
  - `Pesquisando suas transações recentes...`
  - `Analisando padrões de gastos...`

Na implementação real:

- `userInfo` vindo de tool calls é exibido em toasts
- exemplos vindos das tools:
  - procurando telas
  - procurando registros em domínio
  - listando ações
  - confirmando criação/atualização/exclusão

#### 2. Pop-up de pergunta ao usuário

Na implementação real:

- quando a tool `say_to_user` pede mais informação
- UI mostra a pergunta e comunica que o usuário deve responder para continuar

Exemplo de intenção:

- assistente não tem dado suficiente para completar a tarefa
- pergunta algo complementar
- aguarda resposta por voz

#### 3. Pop-up/estado de pensamento

No protótipo:

- box do assistente com placeholder `hmm...`

Na implementação real:

- toast de `Assistente pensando, aguarde`

#### 4. Pop-up de aviso

Na implementação real:

- avisos técnicos e operacionais
- exemplo:
  - erro ao falar mensagem
  - limite mensal atingido
  - warnings internos do run

#### 5. Feedback de navegação/ação

Na execução agêntica real:

- o assistente pode navegar para telas
- executar buscas
- criar/atualizar entidades

A UX futura deve diferenciar melhor:

- `info`
- `navegando`
- `editando`
- `pesquisando`
- `confirmação`
- `pergunta`
- `erro`

## Resposta principal do assistente

Além dos pop-ups temporários, existe um box principal persistente do assistente.

### Papel desse box

- mostrar a fala/resposta principal do turno
- permanecer visível após a resposta
- criar continuidade conversacional

### Requisitos

- durante processamento: pode mostrar placeholder breve
- após resposta: precisa sinalizar próximo passo esperado do usuário

Exemplo:

- `Responda pelo microfone ou escreva para continuar.`

## Controles mínimos da experiência

Durante a conversa, a interface deve oferecer pelo menos:

- botão principal de microfone
- botão para parar a escuta
- botão para enviar manualmente
- botão para encerrar o assistente
- área editável da transcrição

### Botão de encerrar assistente

Objetivo:

- matar a sessão de conversa atual na camada visual
- limpar overlays temporários
- devolver a interface ao estado inicial

Esse controle é diferente de apenas parar de ouvir.

### Botão de parar

Objetivo:

- terminar o trecho atual de captação
- disparar próxima etapa conforme modo escolhido

### Botão de enviar

Objetivo:

- permitir envio explícito
- servir como fallback universal

Mesmo em `Modo Live`, o envio manual deve sempre existir.

## Configurações da feature

As configurações ligadas ao assistente devem ser tratadas como parte da feature, não como detalhe técnico secundário.

### Configurações atuais ou já comunicadas no layout

#### Voz e Áudio

- ativar voz do assistente
- velocidade da fala
- escolher voz
- testar voz

#### Comportamento do assistente

- `Modo Live`
- `Modo Manual`

#### Comportamento do microfone

- `Segurar para falar`
- `Clique para começar / Clique para parar`

### Configurações candidatas futuras

- ativar/desativar auto-envio
- duração da janela de auto-envio
- sensibilidade de silêncio
- confirmar antes de executar ações críticas
- responder por voz sempre / só em algumas situações / nunca
- prioridade entre entrada por voz e texto

## Requisitos de arquitetura de UX

### 1. Desacoplamento entre UX e engine de STT

A experiência não pode depender semanticamente de `SpeechRecognition` do navegador.

O contrato da feature deve aceitar, no futuro:

- Web Speech API
- Whisper em WebAssembly
- Whisper.cpp com WebGPU
- STT remoto

O que não pode mudar quando o motor mudar:

- estados de UI
- controles
- regras de auto-envio
- edição da transcrição
- fluxo de pop-ups
- preferências do usuário

### 2. Fonte única de preferências

As preferências da experiência de voz precisam convergir para uma fonte única de estado/persistência.

Hoje parte está:

- no layout novo como estado local conceitual
- no legado em `ProjectStorage`
- em implementações separadas

Objetivo futuro:

- unificar persistência e leitura das preferências da feature

### 3. Separar claramente

- captura de áudio
- transcrição
- edição da mensagem
- envio do turno
- execução agêntica
- resposta TTS
- feedback visual

## Cenários de uso que a feature precisa cobrir

### Cenário 1. Usuário conversacional contínuo

Exemplo:

- prefere ativar e falar longamente
- quer pouca intervenção manual

Modo recomendado:

- `Live + Clique`

### Cenário 2. Usuário estilo WhatsApp

Exemplo:

- fala um trecho
- revisa
- envia manualmente

Modo recomendado:

- `Manual + Clique`

### Cenário 3. Usuário com foco em privacidade

Exemplo:

- quer captação apenas enquanto estiver segurando

Modo recomendado:

- `Manual + Segurar`

### Cenário 4. Usuário híbrido

Exemplo:

- quer captura rápida por voz
- mas corrige texto antes de enviar

Modo recomendado:

- `Live + Segurar` ou `Live + Clique`
- com cancelamento automático do envio ao editar

### Cenário 5. Assistente pede informação adicional

Fluxo:

- usuário faz pedido incompleto
- assistente pergunta algo
- interface precisa deixar claro que agora está aguardando a resposta do usuário

### Cenário 6. Assistente executa várias tools

Fluxo:

- usuário pede algo complexo
- assistente navega, pesquisa, lista opções, atualiza dados

Requisito:

- interface deve comunicar progresso e intenção sem poluir a tela

## Decisões já consolidadas neste documento

1. O assistente deve ter modos distintos de interação.
2. O microfone deve ter modos distintos de ativação.
3. Auto-envio faz parte do `Modo Live`.
4. Editar a transcrição cancela auto-envio.
5. O envio manual sempre deve existir como fallback.
6. O assistente deve exibir feedbacks temporários do que está fazendo.
7. A resposta principal do assistente deve ficar visível após o turno.
8. A UX deve ser agnóstica ao motor de STT/TTS.

## Itens em aberto para evolução futura

1. Tempo padrão do auto-envio.
2. Se silêncio detectado deve equivaler a `stop`.
3. Se o modo manual pode ter variação `parar e enviar` versus `parar e revisar`.
4. Como categorizar visualmente cada tipo de pop-up.
5. Quando a resposta do assistente deve ser falada automaticamente.
6. Como a conversa contínua deve se comportar em mobile com falhas de STT.
7. Como persistir e sincronizar preferências entre web/mobile no futuro.

## Próximos passos recomendados

1. Transformar este documento em referência oficial da feature.
2. Marcar no documento o que já está implementado versus o que ainda é intenção.
3. Unificar as preferências de voz e comportamento em um estado persistente único.
4. Plugar o layout novo do assistente ao motor real do `AssistantController`.
5. Evoluir os pop-ups para tipos explícitos de feedback agêntico.
6. Validar os modos com testes reais de usuários antes de fixar defaults.
