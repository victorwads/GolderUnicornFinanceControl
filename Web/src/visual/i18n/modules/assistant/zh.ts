import type AssistantModuleTranslation from './base';

const zh: AssistantModuleTranslation = {
  speech: {
    title: "购物清单项目",
    howToUseTitle: "使用方法",
    intro1: "自然地谈论你已经拥有的物品以及需要购买的物品。助手会理解你的话，将项目添加、删除或更新，并把已有物品与购物清单分开。",
    intro2: "你可以提到名称、到期、是否已打开/使用、数量、支付金额、存放位置等。",
    examplesTitle: "示例：",
    examples: [
      "我需要买鸡蛋和牛奶",
      "我买了2包大米",
      "橱柜里有3包意大利面",
      "冰箱里有火腿和奶酪已打开，3天后会坏掉",
      "咖啡包装2个月后过期",
      "我没有豆子了"
    ],
    micStart: "开始监听",
    micStop: "停止监听",
    placeholderListeningHasItems: "尽管说",
    placeholderListeningNoItems: "开始说话",
    placeholderNotListening: "按下按钮开始说话",
    haveListTitle: "已有",
    toBuyListTitle: "待购买",
    browserNotSupported: "浏览器不支持语音识别。",
    changeLangTooltip: "点击更改语言",
    tokensUsed: (tokens,price)=>`\u5DF2\u7528: ${tokens} \u4EE4\u724C, R$ ${price}`
  },
  aiMic: {
    onboarding: {
      info: {
        title: "语音识别测试",
        p1: "应用使用的语音识别依赖系统支持，需要确认你的设备是否兼容。",
        p2: "让我们快速测试一下，确认一切正常。"
      },
      lang: {
        title: "确认语言",
        p1: "请确认应用语言正确，并确保你说话使用的语言与设备上配置的语言一致。"
      },
      verification: {
        title: "重复短语",
        instructions: "请说出下面显示的句子，我们将验证语音识别功能。",
        retry: "匹配度不够，请再试一次。",
        success: "很好！继续下一句话。",
        waiting: "等待你的语音...",
        targetLabel: "目标短语",
        transcriptLabel: "识别文本",
        scoreLabel: "得分"
      },
      progress: (passed,target)=>`\u5B8C\u6210 ${passed}/${target}`,
      success: {
        title: "一切就绪！",
        p1: "你的设备兼容语音识别。"
      },
      fail: {
        title: "暂时无法验证",
        p1: "目前无法确认语音识别兼容性。"
      },
      actions: {
        start: "开始测试",
        confirm: "确认语言",
        back: "返回",
        imDone: "完成",
        tryAgain: "重试",
        close: "关闭"
      }
    },
    onboardingCases: ()=>["\u6D4B\u8BD5\u5C06\u5DE5\u8D44\u8D26\u6237\u7684\u5341\u4E8C\u96F7\u4E9A\u5C14\u8F6C\u5165\u50A8\u84C4\u8D26\u6237\u7684\u8BED\u97F3\u6307\u4EE4\u3002","\u8FDB\u884C\u4E00\u6B21\u8BED\u97F3\u6D4B\u8BD5\uFF0C\u628A\u91D1\u989D R$ 20,00 \u8BB0\u5F55\u4E3A\u4E00\u7B14\u5FEB\u901F\u652F\u51FA\u3002","\u518D\u6B21\u6D4B\u8BD5\uFF0C\u53EA\u8BF4\u4E8C\u5341\u96F7\u4E9A\u5C14\uFF0C\u770B\u770B\u6CA1\u6709\u7B26\u53F7\u662F\u5426\u4ECD\u7136\u8BC6\u522B\u3002","\u8BF4\u8F6C\u8D26\u5341\u4E8C BRL \u5230\u5907\u7528\u8D26\u6237\uFF0C\u7528\u6765\u786E\u8BA4\u8D27\u5E01\u4EE3\u7801\u7684\u5904\u7406\u3002","\u8BF7\u6C42\u628A\u4E94\u5341 USD \u4ECE\u652F\u7968\u8D26\u6237\u8F6C\u5230\u65C5\u884C\u57FA\u91D1\uFF0C\u5E76\u786E\u8BA4\u662F\u5426\u542C\u51FA USD \u5173\u952E\u5B57\u3002","\u5C1D\u8BD5\u6DFB\u52A0\u4E09\u5341\u6B27\u5143\u5230\u6742\u8D27\u7C7B\u522B\u7684\u501F\u65B9\u8BB0\u5F55\uFF0C\u89C2\u5BDF\u591A\u5E01\u79CD\u652F\u6301\u3002","\u53E3\u8FF0\u8BB0\u5F55\u4E00\u7B14\u4E03\u5341\u4E94\u7F8E\u5143\u7684\u73B0\u91D1\u53D6\u6B3E\u5E76\u6DFB\u52A0\u5907\u6CE8 ATM B3\uFF0C\u9A8C\u8BC1\u91D1\u989D\u548C\u5907\u6CE8\u89E3\u6790\u3002","\u8BF4\u652F\u4ED8 USB \u8BA2\u9605\uFF0C\u67E5\u770B\u662F\u5426\u4F1A\u4E0E USD \u6DF7\u6DC6\u3002","\u8BF4\u767B\u8BB0\u4E00\u7B14\u4E00\u767E\u4E8C\u5341\u58A8\u897F\u54E5\u6BD4\u7D22\u7684\u62A5\u9500\uFF0C\u6D4B\u8BD5\u5916\u5E01\u540D\u79F0\u3002","\u8BF4\u641C\u7D22\u5BA2\u6237 Maria da Silva \u7684\u8D26\u6237\uFF0C\u68C0\u9A8C\u5168\u540D\u8BC6\u522B\u3002","\u8BF7\u6C42\u663E\u793A BRL \u5355\u4F4D\u7684 Visa \u4F01\u4E1A\u5361\u989D\u5EA6\uFF0C\u7279\u610F\u6DF7\u5408\u8BED\u8A00\u3002","\u547D\u4EE4\u751F\u6210\u4E00\u4EFD\u6BD4\u8F83\u56DB\u6708\u4FE1\u7528\u4E0E\u501F\u8BB0\u603B\u989D\u7684\u62A5\u544A\uFF0C\u6D4B\u8BD5\u62A5\u8868\u52A8\u4F5C\u3002","\u5C1D\u8BD5\u628A\u53D1\u7968\u4E8C\u96F6\u56DB\u4E94\u6807\u8BB0\u4E3A\u4EE5\u7F8E\u5143\u652F\u4ED8\uFF0C\u9A8C\u8BC1\u53E3\u8FF0\u6570\u5B57\u3002","\u8BF4\u6355\u6349 R$ 99,90 \u7684 Spotify \u5FAA\u73AF\u4ED8\u6B3E\uFF0C\u6821\u9A8C\u5C0F\u6570\u91D1\u989D\u3002","\u8BD5\u7740\u628A\u4E8C\u767E BRL \u8F6C\u6210 USD \u5E76\u8BB0\u5F55\u5DEE\u989D\uFF0C\u7528\u4E8E\u538B\u529B\u6D4B\u8BD5\u6362\u6C47\u6D41\u7A0B\u3002"]
  },
  assistant: {
    onboarding: {
      title: "开始使用财务助手",
      description: "让助手带您完成初始设置并个性化您的体验。",
      microRequirement: "开始前我们会先检测麦克风以确保一切正常。",
      start: "立即开始",
      dismiss: "不再显示"
    }
  }
};

export default zh;
