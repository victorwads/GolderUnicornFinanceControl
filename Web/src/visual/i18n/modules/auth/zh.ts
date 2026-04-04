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
    encryptionKeyFileNamePrefix: "gu-yaoshi",
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
      unlock: "Unlock",
      forgotPassword: "我不记得我的密码了",
      recoveryTitle: "使用密钥文件恢复访问",
      recoveryDescription: "你的密码无法被恢复。如果你还保留着加密密钥文件，我们可以用它来解锁这个设备。",
      recoveryWarning: "没有这个文件，恢复就是不可能的。你每次在新设备上登录时都需要它。",
      recoveryUploadLabel: "上传密钥文件",
      recoveryFileExample: (fileName) => `预期的文件名类似这样：${fileName}`,
      recoveryFileSelected: (fileName) => `已上传文件：${fileName}`,
      recoveryPending: "请上传密钥文件以继续。",
      backToPassword: "返回密码输入",
      recoveryWrongAccount: "这个密钥文件属于另一个账户。",
      recoverySuccessTitle: "加密已解锁",
      recoverySuccessDescription: "密钥文件已通过验证，你的本地数据现在可以访问了。",
      recoveryErrorTitle: "恢复访问失败"
    }
  }
};

export default zh;
