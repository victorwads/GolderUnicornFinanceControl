import type AuthModuleTranslation from './base';

const hi: AuthModuleTranslation = {
  login: {
    loginWithGoogle: "Google से लॉगिन करें",
    loginWithApple: "Apple ID से लॉगिन करें"
  },
  auth: {
    appLoading: "Loading app...",
    notFoundTitle: "Page not found",
    notFoundDescription: "We could not find the screen you tried to open.",
    backToHome: "Back to home",
    encryptionKeyFileNamePrefix: "gu-kunji",
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
      stepDownloadWarning: "आगे बढ़ने से पहले आपको यह फ़ाइल डाउनलोड करनी होगी। इसके बिना, भविष्य में रिकवरी असंभव है।",
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
      forgotPassword: "मुझे अपना पासवर्ड याद नहीं है",
      recoveryTitle: "अपनी key file से access वापस पाएं",
      recoveryDescription: "आपका पासवर्ड वापस पाने का कोई तरीका नहीं है। अगर आपके पास encryption key file अभी भी है, तो हम उससे इस डिवाइस को अनलॉक कर सकते हैं।",
      recoveryWarning: "इस फ़ाइल के बिना recovery असंभव है। नए डिवाइस पर साइन इन करते समय आपको यह फ़ाइल हमेशा चाहिए होगी।",
      recoveryLoggedInHint: "अगर आपकी account अभी भी किसी दूसरे device पर logged in है, तो वहाँ Settings > Privacy में जाकर अपनी key download करें और फिर यहाँ लौटें।",
      recoveryUploadLabel: "Key file अपलोड करें",
      recoveryFileExample: (fileName) => `अपेक्षित फ़ाइल नाम कुछ ऐसा दिखता है: ${fileName}`,
      recoveryFileSelected: (fileName) => `अपलोड की गई फ़ाइल: ${fileName}`,
      recoveryPending: "जारी रखने के लिए key file अपलोड करें।",
      backToPassword: "पासवर्ड पर वापस जाएँ",
      recoveryWrongAccount: "यह key file किसी दूसरी account की है।",
      recoverySuccessTitle: "Encryption unlocked",
      recoverySuccessDescription: "Key file वैध पाई गई और आपका local data अब उपलब्ध है।",
      recoveryErrorTitle: "Access recover नहीं हो सका"
    }
  }
};

export default hi;
