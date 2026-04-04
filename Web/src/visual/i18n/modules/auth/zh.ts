import type AuthModuleTranslation from './base';

const zh: AuthModuleTranslation = {
  login: {
    loginWithGoogle: "使用 Google 登录",
    loginWithApple: "使用 Apple ID 登录"
  },
  auth: {
    appLoading: "Loading app...",
    notFoundTitle: "Page not found",
    notFoundDescription: "We could not find the screen you tried to open.",
    backToHome: "Back to home",
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
      stepDownloadWarning: "继续之前，您必须下载此文件。没有它，未来将无法恢复。",
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
      unlock: "Unlock"
    }
  }
};

export default zh;
