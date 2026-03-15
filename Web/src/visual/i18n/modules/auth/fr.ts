import type AuthModuleTranslation from './base';

const fr: AuthModuleTranslation = {
  login: {
    loginWithGoogle: "Se connecter avec Google",
    loginWithApple: "Se connecter avec Apple ID"
  },
  auth: {
    appLoading: "Loading app...",
    notFoundTitle: "Page not found",
    notFoundDescription: "We could not find the screen you tried to open.",
    backToHome: "Back to home",
    encryptionSetup: {
      title: "Set up encryption",
      description: "Create a password to protect your local data.",
      createPassword: "Create password",
      confirmPassword: "Confirm password",
      savePassword: "Save password"
    },
    encryptionUnlock: {
      title: "Unlock encryption",
      description: "Enter your password to access your local data.",
      password: "Password",
      unlock: "Unlock"
    }
  }
};

export default fr;
