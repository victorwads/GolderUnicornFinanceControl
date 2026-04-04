import type AuthModuleTranslation from './base';

const en: AuthModuleTranslation = {
  login: {
    loginWithGoogle: "Login with Google",
    loginWithApple: "Login with Apple ID"
  },
  auth: {
    appLoading: "Loading app...",
    notFoundTitle: "Page not found",
    notFoundDescription: "We could not find the screen you tried to open.",
    backToHome: "Back to home",
    encryptionKeyFileNamePrefix: "gu-key",
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
      stepDownloadWarning: "You must download this file before continuing. Without it, future recovery is impossible.",
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
      forgotPassword: "I don't remember my password",
      recoveryTitle: "Recover access with your key file",
      recoveryDescription: "There is no way to recover your password. If you still have the encryption key file, we can unlock this device with it.",
      recoveryWarning: "Without this file, recovery is impossible. You will need it whenever you sign in on a new device.",
      recoveryLoggedInHint: "If you are still signed in on another device, open Settings > Privacy there and download your key before continuing.",
      recoveryUploadLabel: "Upload key file",
      recoveryFileExample: (fileName) => `The expected file name looks like this: ${fileName}`,
      recoveryFileSelected: (fileName) => `Uploaded file: ${fileName}`,
      recoveryPending: "Upload the key file to continue.",
      backToPassword: "Back to password",
      recoveryWrongAccount: "This key file belongs to a different account.",
      recoverySuccessTitle: "Encryption unlocked",
      recoverySuccessDescription: "The key file was validated and your local data is now available.",
      recoveryErrorTitle: "Failed to recover access"
    }
  }
};

export default en;
