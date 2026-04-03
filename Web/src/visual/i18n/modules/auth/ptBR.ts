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
    encryptionSetup: {
      title: "Configurar criptografia",
      description: "Crie uma senha para proteger e descriptografar seus dados locais neste dispositivo.",
      createPassword: "Criar senha",
      confirmPassword: "Confirmar senha",
      deviceOnly: "A senha é usada localmente para abrir seus dados sempre que este dispositivo perder a sessão criptográfica.",
      noRecovery: "Não existe recuperação automática dessa senha. Guarde-a em um lugar seguro.",
      savePassword: "Salvar senha"
    },
    encryptionUnlock: {
      title: "Desbloquear criptografia",
      description: "Digite sua senha para acessar seus dados locais.",
      password: "Senha",
      helper: "Sem a senha correta, o app não consegue descriptografar as informações salvas localmente.",
      unlock: "Desbloquear"
    }
  }
};

export default ptBR;
