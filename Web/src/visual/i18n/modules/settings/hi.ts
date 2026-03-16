import type SettingsModuleTranslation from './base';

const hi: SettingsModuleTranslation = {
  settings: {
    title: "सेटिंग्स",
    data: "डेटा",
    myData: "मेरे डेटा",
    exportData: "मेरा डेटा निर्यात करें",
    exportingData: (filename,current,max)=>`${filename} \u0928\u093F\u0930\u094D\u092F\u093E\u0924 \u0939\u094B \u0930\u0939\u093E \u0939\u0948 (${current}/${max})%`,
    exportDataError: "हम आपका डेटा निर्यात नहीं कर सके। कृपया पुनः प्रयास करें।",
    deleteData: "मेरे सभी डेटा हटाएँ",
    deleteDataConfirm: "क्या आप सुनिश्चित हैं? आपका डेटा पहले निर्यात होगा और फिर स्थायी रूप से हटा दिया जाएगा।",
    deleteDataPrompt: phrase=>`\u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F "${phrase}" \u091F\u093E\u0907\u092A \u0915\u0930\u0947\u0902\u0964`,
    deleteDataMismatch: "डाला गया वाक्यांश मेल नहीं खाया। कुछ भी नहीं हटाया गया।",
    deleteDataSuccess: "आपके सभी डेटा हटा दिए गए हैं। अब आपको साइन आउट किया जाएगा।",
    deleteDataError: "डेटा हटाने की प्रक्रिया पूरी नहीं हो सकी। कृपया पुनः प्रयास करें।",
    deleteDataPhrases: ()=>["\u092E\u0948\u0902 \u0905\u092A\u0928\u0947 \u0938\u092D\u0940 \u0921\u0947\u091F\u093E \u0939\u091F\u093E\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0938\u0939\u092E\u0924 \u0939\u0942\u0901","\u092E\u0948\u0902 \u0905\u092A\u0928\u093E \u0921\u0947\u091F\u093E \u0938\u094D\u0925\u093E\u092F\u0940 \u0930\u0942\u092A \u0938\u0947 \u0939\u091F\u093E\u0928\u093E \u091A\u093E\u0939\u0924\u093E \u0939\u0942\u0901","\u092E\u0941\u091D\u0947 \u092A\u0924\u093E \u0939\u0948 \u0915\u093F \u092F\u0939 \u0915\u094D\u0930\u093F\u092F\u093E \u0905\u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928\u0940\u092F \u0939\u0948","\u092E\u0947\u0930\u0947 \u0916\u093E\u0924\u0947 \u0938\u0947 \u091C\u0941\u0921\u093C\u0940 \u0939\u0930 \u091A\u0940\u091C \u0939\u091F\u093E \u0926\u0947\u0902","\u0939\u093E\u0901, \u0905\u092D\u0940 \u092E\u0947\u0930\u093E \u0938\u093E\u0930\u093E \u0921\u0947\u091F\u093E \u092E\u093F\u091F\u093E \u0926\u0947\u0902"],
    deletingData: (filename,current,max)=>`${filename} \u0915\u094B \u0939\u091F\u093E\u092F\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948 (${current}/${max})...`,
    auth: "प्रमाणीकरण",
    logout: "लॉगआउट",
    clearLocalCaches: "स्थानीय कैश साफ़ करें",
    resetOnboarding: "ऑनबोर्डिंग रीसेट करें",
    theme: "थीम",
    density: "घनत्व",
    loadingDatabaseUsage: "डेटाबेस उपयोग लोड हो रहा है...",
    language: "भाषा",
    toggleEncryption: disabled=>disabled?"\u090F\u0928\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u0936\u0928 \u0938\u0915\u094D\u0937\u092E \u0915\u0930\u0947\u0902 (\u0915\u0947\u0935\u0932 DEV)":"\u090F\u0928\u094D\u0915\u094D\u0930\u093F\u092A\u094D\u0936\u0928 \u0905\u0915\u094D\u0937\u092E \u0915\u0930\u0947\u0902 (\u0915\u0947\u0935\u0932 DEV)",
    resavingWithEncryption: (filename,current,max)=>`${filename} \u092B\u093F\u0930 \u0938\u0947 \u0938\u0939\u0947\u091C\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948 (${current}/${max})...`,
    timelineMode: "मोड (वित्तीय महीने के नाम को परिभाषित करने के लिए)",
    timelineModeStart: day=>`\u0926\u093F\u0928 ${day} \u0924\u0915 \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0939\u0940\u0928\u0947 \u0915\u093E \u0928\u093E\u092E`,
    timelineModeNext: day=>`\u0926\u093F\u0928 ${day} \u0915\u0947 \u092C\u093E\u0926 \u0905\u0917\u0932\u0947 \u092E\u0939\u0940\u0928\u0947 \u0915\u093E \u0928\u093E\u092E`,
    timelineCutoffDay: "कट-ऑफ दिन",
    appVersion: "ऐप संस्करण",
    checkUpdates: "अपडेट जांचें",
    checkingUpdates: "अपडेट जांचे जा रहे हैं...",
    newUpdateAvailable: "नया संस्करण उपलब्ध है",
    installUpdate: "अभी अपडेट करें",
    upToDate: "आप नवीनतम संस्करण पर हैं",
    offlineReady: "ऑफ़लाइन उपलब्ध",
    speechRate: "बोलने की गति",
    speechRateSlow: "धीमी",
    speechRateNormal: "सामान्य",
    speechRateFast: "तेज़",
    enableVoice: "आवाज़ सक्षम करें",
    testSpeech: "बोलने का परीक्षण करें",
    selectVoice: "आवाज़ चुनें",
    testSpeechMessage: "यह एक परीक्षण संदेश है जो मेरी बातचीत का उदाहरण देता है।",
    listVoices: "आवाज़ें सूचीबद्ध करें",
    hideVoices: "आवाज़ें छुपाएँ",
    availableVoices: "उपलब्ध आवाज़ें",
    assistantMode: {
      title: "असिस्टेंट मोड",
      live: {
        name: "लाइव मोड",
        description: "असिस्टेंट लगातार सुनता है और आपके बोलना बंद करते ही जवाब देता है। स्वाभाविक और सहज बातचीत के लिए आदर्श।",
      },
      manual: {
        name: "मैनुअल मोड",
        description: "आप तय करते हैं कि असिस्टेंट कब सुने। बोलने के लिए माइक्रोफोन दबाएँ और भेजने के लिए फिर दबाएँ। अधिक नियंत्रण और गोपनीयता।",
      },
    },
    microphoneMode: {
      title: "माइक्रोफोन मोड",
      helper: "ये विकल्प केवल मैनुअल मोड में दिखते हैं, जहाँ आप तय करते हैं कि कैप्चर को ठीक कैसे शुरू और बंद करना है।",
      hold: {
        name: "बोलने के लिए दबाकर रखें",
        description: "बोलते समय बटन दबाकर रखें",
      },
      click: {
        name: "शुरू करने के लिए क्लिक / रोकने के लिए क्लिक",
        description: "शुरू करने के लिए एक बार क्लिक करें और समाप्त करने के लिए फिर क्लिक करें",
      },
    }
  }
};

export default hi;
