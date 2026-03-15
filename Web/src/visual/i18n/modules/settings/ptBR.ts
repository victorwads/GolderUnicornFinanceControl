import type SettingsModuleTranslation from './base';

const ptBR: SettingsModuleTranslation = {
  settings: {
    title: "Configurações",
    data: "Dados",
    myData: "Meus Dados",
    exportData: "Exportar Meus Dados",
    exportingData: (filename,current,max)=>`Exportando ${filename} (${current}/${max})%`,
    exportDataError: "Não foi possível exportar seus dados. Tente novamente.",
    deleteData: "Excluir todos os meus dados",
    deleteDataConfirm: "Tem certeza? Seus dados serão exportados e excluídos permanentemente.",
    deleteDataPrompt: phrase=>`Digite "${phrase}" para confirmar.`,
    deleteDataMismatch: "A frase digitada está incorreta. Nenhum dado foi excluído.",
    deleteDataSuccess: "Todos os seus dados foram excluídos. Você será desconectado em seguida.",
    deleteDataError: "Não foi possível concluir a exclusão dos dados. Tente novamente.",
    deleteDataPhrases: ()=>["Eu aceito excluir todos os meus dados","Quero remover definitivamente meus dados","Estou ciente de que isso \xE9 irrevers\xEDvel","Autorizo apagar permanentemente meus dados","Sim, desejo apagar tudo da minha conta"],
    deletingData: (filename,current,max)=>`Excluindo ${filename} (${current}/${max})...`,
    auth: "Autenticação",
    logout: "Sair",
    clearLocalCaches: "Limpar caches locais",
    resetOnboarding: "Reiniciar onboarding",
    theme: "Tema",
    density: "Densidade",
    loadingDatabaseUsage: "Carregando uso do banco de dados...",
    language: "Idioma",
    toggleEncryption: disabled=>disabled?"Ativar Criptografia (DEV only)":"Desativar Criptografia (DEV only)",
    resavingWithEncryption: (filename,current,max)=>`Salvando novamente ${filename} (${current}/${max})...`,
    timelineMode: "Nome do mês financeiro",
    timelineModeStart: day=>`Nome do m\xEAs atual ao dia ${day}`,
    timelineModeNext: day=>`Nome do pr\xF3ximo m\xEAs depois do dia ${day}`,
    timelineCutoffDay: "Dia de início do seu mês financeiro",
    appVersion: "Versão do app",
    checkUpdates: "Buscar atualização",
    checkingUpdates: "Buscando atualização... ",
    newUpdateAvailable: "Nova versão disponível",
    installUpdate: "Atualizar agora",
    upToDate: "Você está usando a versão mais recente",
    offlineReady: "Disponível offline",
    speechRate: "Velocidade da Fala",
    speechRateSlow: "Lento",
    speechRateNormal: "Normal",
    speechRateFast: "Rápido",
    enableVoice: "Ativar voz",
    testSpeech: "Testar Fala",
    selectVoice: "Selecionar voz",
    testSpeechMessage: "Esta é uma mensagem de teste para exemplificar a minha fala.",
    listVoices: "Listar Vozes",
    hideVoices: "Ocultar Vozes",
    availableVoices: "Vozes Disponíveis",
    assistantMode: {
      title: "Modo do assistente",
      live: {
        name: "Modo Live",
        description: "O assistente escuta continuamente e responde automaticamente quando você para de falar. Ideal para conversas naturais e fluidas.",
      },
      manual: {
        name: "Modo Manual",
        description: "Você controla quando o assistente deve escutar. Pressione o botão do microfone para falar e novamente para enviar. Mais controle e privacidade.",
      },
    },
    microphoneMode: {
      title: "Modo do microfone",
      hold: {
        name: "Segurar para falar",
        description: "Pressione e segure o botão enquanto fala",
      },
      click: {
        name: "Clique para começar / Clique para parar",
        description: "Clique uma vez para iniciar, clique novamente para finalizar",
      },
    }
  }
};

export default ptBR;
