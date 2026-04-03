import type { Translation } from "../../core/types";

export default interface AuthModuleTranslation extends Translation {
  login: {
    loginWithGoogle: string;
    loginWithApple: string;
  };
  auth: {
    appLoading: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backToHome: string;
    encryptionSetup: {
      title: string;
      description: string;
      createPassword: string;
      confirmPassword: string;
      deviceOnly: string;
      noRecovery: string;
      savePassword: string;
    };
    encryptionUnlock: {
      title: string;
      description: string;
      password: string;
      helper: string;
      unlock: string;
    };
  };
}
