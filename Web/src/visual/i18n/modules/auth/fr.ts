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
    encryptionKeyFileNamePrefix: "gu-cle",
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
      stepDownloadWarning: "Vous devez télécharger ce fichier avant de continuer. Sans lui, toute récupération future est impossible.",
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
      forgotPassword: "Je ne me souviens pas de mon mot de passe",
      recoveryTitle: "Récupérez l'accès avec votre fichier de clé",
      recoveryDescription: "Il n'existe aucun moyen de récupérer votre mot de passe. Si vous avez encore le fichier de clé de chiffrement, nous pouvons déverrouiller cet appareil avec lui.",
      recoveryWarning: "Sans ce fichier, la récupération est impossible. Vous en aurez besoin à chaque connexion sur un nouvel appareil.",
      recoveryUploadLabel: "Téléverser le fichier de clé",
      recoveryFileExample: (fileName) => `Le nom attendu du fichier ressemble à ceci : ${fileName}`,
      recoveryFileSelected: (fileName) => `Fichier téléversé : ${fileName}`,
      recoveryPending: "Téléversez le fichier de clé pour continuer.",
      backToPassword: "Revenir au mot de passe",
      recoveryWrongAccount: "Ce fichier de clé appartient à un autre compte.",
      recoverySuccessTitle: "Chiffrement déverrouillé",
      recoverySuccessDescription: "Le fichier de clé a été validé et vos données locales sont maintenant disponibles.",
      recoveryErrorTitle: "Impossible de récupérer l'accès"
    }
  }
};

export default fr;
