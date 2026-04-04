import type AuthModuleTranslation from './base';

const ptBR: AuthModuleTranslation = {
  login: {
    loginWithGoogle: "Entrar com Google",
    loginWithApple: "Entrar com Apple ID"
  },
  auth: {
    appLoading: "Carregando aplicativo...",
    notFoundTitle: "Página não encontrada",
    notFoundDescription: "Não encontramos a tela que você tentou abrir.",
    backToHome: "Voltar para a home",
    encryptionKeyFileNamePrefix: "gu-chave",
    encryptionSetup: {
      title: "Configurar criptografia",
      description: "Crie uma senha para proteger e descriptografar seus dados locais neste dispositivo.",
      createPassword: "Criar senha",
      confirmPassword: "Confirmar senha",
      deviceOnly: "A senha é usada localmente para abrir seus dados sempre que este dispositivo perder a sessão criptográfica.",
      noRecovery: "Não existe recuperação automática dessa senha. Guarde-a em um lugar seguro.",
      stepPasswordTitle: "Crie sua senha",
      stepPasswordDescription: "Defina a senha que vai proteger e destravar seus dados neste dispositivo.",
      stepDownloadTitle: "Baixe sua chave de criptografia",
      stepDownloadDescription: "Antes de entrar no app, salve um arquivo com sua chave de criptografia em um local seguro.",
      stepDownloadWarning: "Você precisa baixar esse arquivo antes de continuar. Sem ele, a recuperação futura é impossível.",
      continueToBackup: "Continuar",
      downloadKey: "Baixar arquivo da chave",
      continueToApp: "Entrar no aplicativo",
      keyDownloaded: "Arquivo baixado",
      keyDownloadRequired: "Baixe o arquivo da chave antes de continuar.",
      keyDownloadErrorTitle: "Falha ao baixar a chave",
      savePassword: "Salvar senha"
    },
    encryptionUnlock: {
      title: "Desbloquear criptografia",
      description: "Digite sua senha para acessar seus dados locais.",
      password: "Senha",
      helper: "Sem a senha correta, o app não consegue descriptografar as informações salvas localmente.",
      unlock: "Desbloquear",
      forgotPassword: "Não lembro minha senha",
      recoveryTitle: "Recupere o acesso com seu arquivo da chave",
      recoveryDescription: "Não existe forma de recuperar sua senha. Se você tiver o arquivo da chave de criptografia, podemos desbloquear este dispositivo com ele.",
      recoveryWarning: "Sem esse arquivo, a recuperação é impossível. Você vai precisar dele sempre que entrar em um dispositivo novo.",
      recoveryUploadLabel: "Enviar arquivo da chave",
      recoveryFileExample: (fileName) => `O arquivo esperado tem este formato de nome: ${fileName}`,
      recoveryFileSelected: (fileName) => `Arquivo enviado: ${fileName}`,
      recoveryPending: "Envie o arquivo da chave para continuar.",
      backToPassword: "Voltar para a senha",
      recoveryWrongAccount: "Esse arquivo de chave pertence a outra conta.",
      recoverySuccessTitle: "Criptografia desbloqueada",
      recoverySuccessDescription: "A chave foi validada e seus dados locais foram carregados.",
      recoveryErrorTitle: "Falha ao recuperar acesso"
    }
  }
};

export default ptBR;
