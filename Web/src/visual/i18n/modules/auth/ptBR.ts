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
      description: "Crie uma senha para proteger seus dados locais.",
      createPassword: "Criar senha",
      confirmPassword: "Confirmar senha",
      savePassword: "Salvar senha"
    },
    encryptionUnlock: {
      title: "Desbloquear criptografia",
      description: "Digite sua senha para acessar seus dados locais.",
      password: "Senha",
      unlock: "Desbloquear"
    }
  }
};

export default ptBR;
