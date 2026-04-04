import type AuthModuleTranslation from './base';

const es: AuthModuleTranslation = {
  login: {
    loginWithGoogle: "Iniciar sesión con Google",
    loginWithApple: "Iniciar sesión con Apple ID"
  },
  auth: {
    appLoading: "Loading app...",
    notFoundTitle: "Page not found",
    notFoundDescription: "We could not find the screen you tried to open.",
    backToHome: "Back to home",
    encryptionKeyFileNamePrefix: "gu-clave",
    encryptionSetup: {
      title: "Set up encryption",
      description: "Create a password to protect and unlock your local data on this device.",
      createPassword: "Create password",
      confirmPassword: "Confirm password",
      deviceOnly: "This password is only used locally whenever this device needs to unlock your encrypted data again.",
      noRecovery: "There is no automatic recovery for this password. Keep it somewhere safe.",
      stepPasswordTitle: "Create your password",
      stepPasswordDescription: "Set the password that will protect and unlock your data on this device.",
      stepDownloadTitle: "Download your encryption key",
      stepDownloadDescription: "Before entering the app, save a file with your encryption key somewhere safe.",
      stepDownloadWarning: "Debes descargar este archivo antes de continuar. Sin él, la recuperación futura es imposible.",
      continueToBackup: "Continue",
      downloadKey: "Download key file",
      continueToApp: "Enter the app",
      keyDownloaded: "File downloaded",
      keyDownloadRequired: "Download the key file before continuing.",
      keyDownloadErrorTitle: "Failed to download key",
      savePassword: "Save password"
    },
    encryptionUnlock: {
      title: "Unlock encryption",
      description: "Enter your password to access your local data.",
      password: "Password",
      helper: "Without the correct password, the app cannot decrypt the information stored locally.",
      unlock: "Unlock",
      forgotPassword: "No recuerdo mi contraseña",
      recoveryTitle: "Recupera el acceso con tu archivo de clave",
      recoveryDescription: "No hay forma de recuperar tu contraseña. Si todavía tienes el archivo de la clave de cifrado, podemos desbloquear este dispositivo con él.",
      recoveryWarning: "Sin este archivo, la recuperación es imposible. Lo necesitarás cada vez que inicies sesión en un dispositivo nuevo.",
      recoveryUploadLabel: "Subir archivo de clave",
      recoveryFileExample: (fileName) => `El nombre esperado del archivo se parece a este: ${fileName}`,
      recoveryFileSelected: (fileName) => `Archivo enviado: ${fileName}`,
      recoveryPending: "Sube el archivo de clave para continuar.",
      backToPassword: "Volver a la contraseña",
      recoveryWrongAccount: "Este archivo de clave pertenece a otra cuenta.",
      recoverySuccessTitle: "Cifrado desbloqueado",
      recoverySuccessDescription: "El archivo de clave fue validado y tus datos locales ya están disponibles.",
      recoveryErrorTitle: "No se pudo recuperar el acceso"
    }
  }
};

export default es;
