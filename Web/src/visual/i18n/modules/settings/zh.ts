import type SettingsModuleTranslation from './base';

const zh: SettingsModuleTranslation = {
  settings: {
    title: "设置",
    data: "数据",
    myData: "我的数据",
    exportData: "导出我的数据",
    exportingData: (filename,current,max)=>`\u6B63\u5728\u5BFC\u51FA ${filename} (${current}/${max})%`,
    exportDataError: "未能导出你的数据，请重试。",
    deleteData: "删除我所有的数据",
    deleteDataConfirm: "确定吗？系统会先导出然后永久删除你的数据。",
    deleteDataPrompt: phrase=>`\u8BF7\u8F93\u5165\u201C${phrase}\u201D\u4EE5\u786E\u8BA4\u3002`,
    deleteDataMismatch: "输入的短语不匹配，未删除任何内容。",
    deleteDataSuccess: "已删除你所有的数据，你将随后被登出。",
    deleteDataError: "未能完成数据删除，请重试。",
    deleteDataPhrases: ()=>["\u6211\u540C\u610F\u5220\u9664\u6211\u6240\u6709\u7684\u6570\u636E","\u6211\u8981\u6C38\u4E45\u5220\u9664\u6211\u7684\u6570\u636E","\u6211\u7406\u89E3\u8FD9\u4E2A\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500","\u8BF7\u79FB\u9664\u4E0E\u6211\u8D26\u6237\u6709\u5173\u7684\u4E00\u5207","\u662F\u7684\uFF0C\u73B0\u5728\u5220\u9664\u6211\u6240\u6709\u7684\u6570\u636E"],
    deletingData: (filename,current,max)=>`\u6B63\u5728\u5220\u9664 ${filename} (${current}/${max})...`,
    auth: "认证",
    logout: "登出",
    clearLocalCaches: "清除本地缓存",
    resetOnboarding: "重置引导",
    theme: "主题",
    density: "密度",
    loadingDatabaseUsage: "正在加载数据库使用情况...",
    language: "语言",
    toggleEncryption: disabled=>disabled?"\u542F\u7528\u52A0\u5BC6 (DEV only)":"\u7981\u7528\u52A0\u5BC6 (DEV only)",
    resavingWithEncryption: (filename,current,max)=>`\u91CD\u65B0\u4FDD\u5B58 ${filename} (${current}/${max})...`,
    timelineMode: "模式（定义财务月份名称）",
    timelineModeStart: day=>`\u622A\u81F3 ${day} \u65E5\u7684\u5F53\u524D\u6708\u4EFD\u540D\u79F0`,
    timelineModeNext: day=>`${day} \u65E5\u4E4B\u540E\u7684\u4E0B\u4E2A\u6708\u4EFD\u540D\u79F0`,
    timelineCutoffDay: "截断日",
    appVersion: "应用版本",
    checkUpdates: "检查更新",
    checkingUpdates: "正在检查更新...",
    newUpdateAvailable: "发现新版本",
    installUpdate: "立即更新",
    upToDate: "当前已是最新版本",
    offlineReady: "可离线使用",
    speechRate: "语音速度",
    speechRateSlow: "慢速",
    speechRateNormal: "正常",
    speechRateFast: "快速",
    enableVoice: "启用语音",
    testSpeech: "测试语音",
    selectVoice: "选择语音",
    testSpeechMessage: "这是一个测试消息，用于举例说明我的讲话。",
    listVoices: "列出语音",
    hideVoices: "隐藏语音",
    availableVoices: "可用语音",
    assistantMode: {
      title: "助手模式",
      live: {
        name: "实时模式",
        description: "助手会持续监听，并在你停止说话时自动回复，适合自然流畅的对话。",
      },
      manual: {
        name: "手动模式",
        description: "由你控制助手何时监听。按下麦克风按钮说话，再次按下发送。更可控也更私密。",
      },
    },
    microphoneMode: {
      title: "麦克风模式",
      helper: "这些选项只会在手动模式下出现，由你精确决定如何开始和结束采集。",
      hold: {
        name: "按住说话",
        description: "说话时按住按钮",
      },
      click: {
        name: "点击开始 / 点击停止",
        description: "点击一次开始，再点击一次结束",
      },
    }
  }
};

export default zh;
